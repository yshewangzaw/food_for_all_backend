const {
  Commission,
  WalletTransaction,
  User,
  Notification,
  Order,
} = require("../models");
const sequelize = require("../config/database");
const { Op } = require("sequelize");
const engine = require("./commissionEngine");

// Shared helper: writes the wallet-side reversal for a commission that was
// already credited before being reversed.
const postWalletReversal = async (commission, reason, t) => {
  const user = await User.findByPk(commission.beneficiaryUserId, {
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  if (!user) return;

  const balanceBefore = parseFloat(user.wallet);
  const balanceAfter = balanceBefore - parseFloat(commission.commissionAmount);

  await WalletTransaction.create(
    {
      userId: user.id,
      transactionType: "REVERSAL",
      direction: "DEBIT",
      amount: commission.commissionAmount,
      balanceBefore,
      balanceAfter,
      referenceType: "COMMISSION",
      referenceId: commission.id,
      description: reason || "Commission reversed",
    },
    { transaction: t },
  );

  await user.update({ wallet: balanceAfter }, { transaction: t });
};

const commissionBusinessRepository = {
  processOrder: async (orderId) => {
    const t = await sequelize.transaction();
    try {
      const result = await engine.process(orderId, t);
      await t.commit();
      return result;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  previewOrder: async (orderId) => {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error("Order not found");
    return await engine.calculate(order);
  },

  reverseOrder: async (orderId, reason) => {
    const t = await sequelize.transaction();
    try {
      const commissions = await Commission.findAll({
        where: { orderId },
        transaction: t,
      });
      if (commissions.length === 0) {
        throw new Error("No commissions found for this order");
      }

      const reversedCommissions = [];
      for (const c of commissions) {
        if (c.status === "REVERSED") continue;

        if (c.status === "CREDITED") {
          await postWalletReversal(c, reason, t);
        }

        await c.update(
          { status: "REVERSED", remarks: reason },
          { transaction: t },
        );
        reversedCommissions.push(c);
      }

      await t.commit();
      return reversedCommissions;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  creditCommission: async (commissionId) => {
    const t = await sequelize.transaction();
    try {
      const commission = await Commission.findByPk(commissionId, {
        transaction: t,
      });
      if (!commission) throw new Error("Commission not found");
      if (commission.status !== "PENDING") {
        throw new Error(
          `Cannot credit a commission with status ${commission.status}`,
        );
      }

      const user = await User.findByPk(commission.beneficiaryUserId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!user) throw new Error("Beneficiary not found");

      const balanceBefore = parseFloat(user.wallet);
      const balanceAfter =
        balanceBefore + parseFloat(commission.commissionAmount);

      await WalletTransaction.create(
        {
          userId: user.id,
          transactionType: "COMMISSION_CREDIT",
          direction: "CREDIT",
          amount: commission.commissionAmount,
          balanceBefore,
          balanceAfter,
          referenceType: "COMMISSION",
          referenceId: commission.id,
          description: `Commission credited from order #${commission.orderId}`,
        },
        { transaction: t },
      );

      await user.update({ wallet: balanceAfter }, { transaction: t });
      await commission.update(
        { status: "CREDITED", creditedAt: new Date() },
        { transaction: t },
      );

      await Notification.create(
        {
          userId: user.id,
          category: "COMMISSION",
          title: "Commission credited",
          body: `You earned ${commission.commissionAmount} ETB.`,
          isRead: false,
        },
        { transaction: t },
      );

      await t.commit();
      return commission;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  reverseSingle: async (commissionId, reason) => {
    const t = await sequelize.transaction();
    try {
      const commission = await Commission.findByPk(commissionId, {
        transaction: t,
      });
      if (!commission) throw new Error("Commission not found");
      if (commission.status === "REVERSED") throw new Error("Already reversed");

      if (commission.status === "CREDITED") {
        await postWalletReversal(commission, reason, t);
      }

      await commission.update(
        { status: "REVERSED", remarks: reason },
        { transaction: t },
      );

      await t.commit();
      return commission;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  forfeit: async (commissionId, forfeitReason) => {
    const commission = await Commission.findByPk(commissionId);
    if (!commission) throw new Error("Commission not found");
    if (commission.status !== "PENDING") {
      throw new Error("Only PENDING commissions can be forfeited");
    }
    await commission.update({ status: "REVERSED", forfeitReason });
    return commission;
  },

  batchCredit: async (commissionIds) => {
    const results = { credited: [], failed: [] };
    for (const id of commissionIds) {
      try {
        const c = await commissionBusinessRepository.creditCommission(id);
        results.credited.push(c.id);
      } catch (error) {
        results.failed.push({ id, reason: error.message });
      }
    }
    return results;
  },

  recalculate: async (periodStart, periodEnd) => {
    const orders = await Order.findAll({
      where: {
        status: "PAID",
        createdAt: { [Op.gte]: periodStart, [Op.lt]: periodEnd },
      },
    });

    const summary = { ordersProcessed: 0, commissionsCreated: 0, errors: [] };

    for (const order of orders) {
      try {
        const existing = await Commission.findAll({
          where: { orderId: order.id },
        });
        if (existing.length > 0) {
          await Commission.update(
            { status: "REVERSED", remarks: "Superseded by recalculation" },
            { where: { orderId: order.id } },
          );
        }

        const t = await sequelize.transaction();
        const { results } = await engine.calculate(order);
        await Commission.bulkCreate(
          results.map((r) => ({ ...r, orderId: order.id, status: "PENDING" })),
          { transaction: t },
        );
        await t.commit();

        summary.ordersProcessed++;
        summary.commissionsCreated += results.length;
      } catch (error) {
        summary.errors.push({ orderId: order.id, reason: error.message });
      }
    }

    return summary;
  },

  getPendingSummary: async () => {
    const pending = await Commission.findAll({ where: { status: "PENDING" } });

    const byUser = {};
    for (const c of pending) {
      const key = c.beneficiaryUserId;
      if (!byUser[key])
        byUser[key] = { userId: key, totalPending: 0, byLevel: {} };
      byUser[key].totalPending += parseFloat(c.commissionAmount);
      const levelKey = c.levelId ?? "direct";
      byUser[key].byLevel[levelKey] =
        (byUser[key].byLevel[levelKey] || 0) + parseFloat(c.commissionAmount);
    }

    const totalPendingLiability = pending.reduce(
      (sum, c) => sum + parseFloat(c.commissionAmount),
      0,
    );

    return { totalPendingLiability, byUser: Object.values(byUser) };
  },

  getMySummary: async (userId, period) => {
    const where = { beneficiaryUserId: userId };
    if (period) {
      const [year, month] = period.split("-").map(Number);
      where.createdAt = {
        [Op.gte]: new Date(year, month - 1, 1),
        [Op.lt]: new Date(year, month, 1),
      };
    }

    const commissions = await Commission.findAll({ where });

    const summary = {
      earned: 0,
      pending: 0,
      forfeited: 0,
      reversed: 0,
      byLevel: {},
    };

    for (const c of commissions) {
      const amount = parseFloat(c.commissionAmount);
      const levelKey = c.levelId ?? "direct";
      summary.byLevel[levelKey] = (summary.byLevel[levelKey] || 0) + amount;

      if (c.status === "CREDITED") summary.earned += amount;
      else if (c.status === "PENDING") summary.pending += amount;
      else if (c.status === "REVERSED" && c.forfeitReason)
        summary.forfeited += amount;
      else if (c.status === "REVERSED") summary.reversed += amount;
    }

    return summary;
  },

  getMyBySource: async (userId) => {
    const commissions = await Commission.findAll({
      where: { beneficiaryUserId: userId, status: "CREDITED" },
    });

    const bySource = {};
    for (const c of commissions) {
      const key = c.sourceUserId;
      bySource[key] = (bySource[key] || 0) + parseFloat(c.commissionAmount);
    }

    const sourceIds = Object.keys(bySource).map(Number);
    if (sourceIds.length === 0) return [];

    const sources = await User.findAll({
      where: { id: { [Op.in]: sourceIds } },
      attributes: ["id", "fullName", "email"],
    });

    return sources
      .map((s) => ({ ...s.toJSON(), totalGenerated: bySource[s.id] }))
      .sort((a, b) => b.totalGenerated - a.totalGenerated);
  },

  getMyTimeline: async (userId, groupBy = "month") => {
    const commissions = await Commission.findAll({
      where: { beneficiaryUserId: userId, status: "CREDITED" },
      order: [["creditedAt", "ASC"]],
    });

    const timeline = {};
    for (const c of commissions) {
      const date = new Date(c.creditedAt);
      const key =
        groupBy === "day"
          ? date.toISOString().slice(0, 10)
          : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      timeline[key] = (timeline[key] || 0) + parseFloat(c.commissionAmount);
    }

    return Object.entries(timeline).map(([period, total]) => ({
      period,
      total,
    }));
  },
};

module.exports = commissionBusinessRepository;
