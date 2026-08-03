const {
  NetworkPath,
  User,
  LevelConfiguration,
  CommissionRule,
  Commission,
  Order,
  OrderItem,
  Package,
} = require("../models");
const { Op } = require("sequelize");

/**
 * Checks whether a user bought a qualifying package within the given month.
 * NOTE: this is a per-request join because there's no MemberQualification
 * table yet (schema-gaps.md #2). It works, but it's the expensive way —
 * fix that gap if this becomes a hot path.
 */
const isQualifiedInMonth = async (userId, monthDate) => {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    1,
  );

  const qualifyingOrder = await Order.findOne({
    where: {
      buyerUserId: userId,
      status: "PAID",
      createdAt: { [Op.gte]: monthStart, [Op.lt]: monthEnd },
    },
    include: [
      {
        model: OrderItem,
        as: "items",
        required: true,
        include: [
          {
            model: Package,
            as: "package",
            required: true,
            where: { isQualifying: true },
          },
        ],
      },
    ],
  });

  return !!qualifyingOrder;
};

const computeAmount = (rule, baseAmount) => {
  let amount =
    rule.rateType === "FLAT"
      ? parseFloat(rule.rateValue)
      : (parseFloat(baseAmount) * parseFloat(rule.rateValue)) / 100;

  if (
    rule.maximumCommissionAmount !== null &&
    rule.maximumCommissionAmount !== undefined
  ) {
    amount = Math.min(amount, parseFloat(rule.maximumCommissionAmount));
  }

  return Math.round(amount * 100) / 100; // round to 2dp
};

/**
 * Computes what an order WOULD pay, without writing anything.
 * Used directly by simulate, preview, and as the first phase of process().
 */
const calculate = async (order) => {
  const results = [];
  const skipped = [];

  const activeConfig = await LevelConfiguration.findOne({
    where: { isActive: true, isCommissionEligible: true },
  });

  if (!activeConfig) {
    return {
      results,
      skipped: [
        { reason: "No active, commission-eligible LevelConfiguration" },
      ],
    };
  }

  const activeRules = await CommissionRule.findAll({
    where: { levelConfigurationId: activeConfig.id, isActive: true },
  });

  const now = new Date(order.createdAt || Date.now());

  // --- DIRECT_SALE: pays the buyer/seller themselves ---
  const directRule = activeRules.find(
    (r) => r.commissionType === "DIRECT_SALE",
  );
  if (directRule) {
    if (parseFloat(order.totalPv) >= parseFloat(directRule.minimumPV)) {
      const buyerQualified = await isQualifiedInMonth(order.buyerUserId, now);
      if (buyerQualified) {
        results.push({
          beneficiaryUserId: order.buyerUserId,
          sourceUserId: order.buyerUserId,
          commissionRuleId: directRule.id,
          commissionType: "DIRECT_SALE",
          levelId: null,
          baseAmount: order.totalAmount,
          commissionAmount: computeAmount(directRule, order.totalAmount),
        });
      } else {
        skipped.push({
          rule: directRule.id,
          reason: "Buyer not qualified this month — forfeited",
          userId: order.buyerUserId,
        });
      }
    }
  }

  // --- REFERRAL: pays ancestors at levels 1..maximumDepth ---
  const referralRules = activeRules.filter(
    (r) => r.commissionType === "REFERRAL",
  );
  if (referralRules.length > 0 && order.buyerUserId) {
    const ancestorPaths = await NetworkPath.findAll({
      where: {
        descendantId: order.buyerUserId,
        level: { [Op.gt]: 0, [Op.lte]: activeConfig.maximumDepth },
      },
    });

    for (const path of ancestorPaths) {
      const rule = referralRules.find((r) => r.level === path.level);
      if (!rule) continue;
      if (parseFloat(order.totalPv) < parseFloat(rule.minimumPV)) continue;

      const ancestor = await User.findByPk(path.ancestorId);
      if (!ancestor || ancestor.status !== "ACTIVE") {
        skipped.push({
          rule: rule.id,
          reason: "Ancestor not active",
          userId: path.ancestorId,
        });
        continue;
      }

      const ancestorQualified = await isQualifiedInMonth(path.ancestorId, now);
      if (!ancestorQualified) {
        skipped.push({
          rule: rule.id,
          reason: "Ancestor not qualified this month — forfeited",
          userId: path.ancestorId,
        });
        continue;
      }

      results.push({
        beneficiaryUserId: path.ancestorId,
        sourceUserId: order.buyerUserId,
        commissionRuleId: rule.id,
        commissionType: "REFERRAL",
        levelId: path.level,
        baseAmount: order.totalAmount,
        commissionAmount: computeAmount(rule, order.totalAmount),
      });
    }
  }

  return { results, skipped, levelConfigurationUsed: activeConfig.id };
};

/**
 * Actually writes Commission rows for an order. Idempotent: if rows already
 * exist for this orderId, returns them unchanged rather than paying twice.
 */
const process = async (orderId, transaction) => {
  const existing = await Commission.findAll({
    where: { orderId },
    transaction,
  });
  if (existing.length > 0) {
    return { alreadyProcessed: true, commissions: existing };
  }

  const order = await Order.findByPk(orderId, { transaction });
  if (!order) throw new Error("Order not found");
  if (order.status !== "PAID") {
    throw new Error("Order must be PAID before commissions can be processed");
  }

  const { results, skipped } = await calculate(order);

  const created = await Commission.bulkCreate(
    results.map((r) => ({ ...r, orderId, status: "PENDING" })),
    { transaction },
  );

  return { alreadyProcessed: false, commissions: created, skipped };
};

module.exports = { calculate, process, isQualifiedInMonth, computeAmount };
