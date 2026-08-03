const {
  MemberQualification,
  User,
  Order,
  OrderItem,
  Package,
} = require("../models");
const sequelize = require("../config/database");
const { Op, QueryTypes } = require("sequelize");
const { getPagination, buildMeta } = require("../utils/pagination");

const periodOf = MemberQualification.periodOf;

const qualificationRepository = {
  periodOf,

  /**
   * Called from payment approval. Idempotent by the unique (userId, period)
   * key — a second qualifying order in the same month updates the existing
   * row's PV rather than creating a duplicate.
   */
  record: async ({ userId, orderId, pv, period }, t = null) => {
    const key = period || periodOf(new Date());

    const existing = await MemberQualification.findOne({
      where: { userId, period: key },
      transaction: t,
    });

    if (existing) {
      await existing.update(
        {
          isQualified: true,
          qualifiedAt: existing.qualifiedAt || new Date(),
          pvAchieved: parseFloat(existing.pvAchieved) + parseFloat(pv || 0),
          orderId: existing.orderId || orderId,
        },
        { transaction: t },
      );
      return existing;
    }

    return await MemberQualification.create(
      {
        userId,
        period: key,
        orderId: orderId || null,
        isQualified: true,
        qualifiedAt: new Date(),
        pvAchieved: pv || 0,
        source: orderId ? "ORDER" : "MANUAL",
      },
      { transaction: t },
    );
  },

  /**
   * The hot path. This is the lookup that replaces the 3-table join the
   * commission engine currently runs per beneficiary per sale.
   */
  isQualified: async (userId, period) => {
    const key = period || periodOf(new Date());
    const row = await MemberQualification.findOne({
      where: { userId, period: key, isQualified: true },
      attributes: ["id"],
    });
    return !!row;
  },

  /** Batch version — one query for a whole commission run. */
  areQualified: async (userIds, period) => {
    const key = period || periodOf(new Date());
    if (!userIds.length) return {};

    const rows = await MemberQualification.findAll({
      where: { userId: { [Op.in]: userIds }, period: key, isQualified: true },
      attributes: ["userId"],
      raw: true,
    });

    const set = new Set(rows.map((r) => r.userId));
    return userIds.reduce((acc, id) => ({ ...acc, [id]: set.has(id) }), {});
  },

  getStatus: async (userId, period) => {
    const key = period || periodOf(new Date());
    const row = await MemberQualification.findOne({
      where: { userId, period: key },
      include: [
        {
          model: Order,
          as: "order",
          attributes: ["id", "orderNumber", "totalAmount", "totalPv"],
          required: false,
        },
      ],
    });

    // days left in the period — drives the "renew now" banner
    const now = new Date();
    const [y, m] = key.split("-").map(Number);
    const periodEnd = new Date(y, m, 0, 23, 59, 59);
    const daysRemaining = Math.max(
      0,
      Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24)),
    );

    return {
      userId: Number(userId),
      period: key,
      isQualified: row ? row.isQualified : false,
      qualifiedAt: row ? row.qualifiedAt : null,
      pvAchieved: row ? parseFloat(row.pvAchieved) : 0,
      qualifyingOrder: row && row.order ? row.order : null,
      source: row ? row.source : null,
      periodEnd,
      daysRemaining,
    };
  },

  /** Admin override — grants qualification without a purchase. Audited. */
  grantManual: async ({ userId, period, remarks }, adminId) => {
    if (!remarks || !remarks.trim()) {
      throw new Error("Remarks are required for a manual qualification");
    }
    const key = period || periodOf(new Date());

    const [row, created] = await MemberQualification.findOrCreate({
      where: { userId, period: key },
      defaults: {
        userId,
        period: key,
        isQualified: true,
        qualifiedAt: new Date(),
        source: "MANUAL",
        remarks: `${remarks.trim()} (by admin #${adminId})`,
      },
    });

    if (!created) {
      await row.update({
        isQualified: true,
        qualifiedAt: row.qualifiedAt || new Date(),
        source: "MANUAL",
        remarks: `${remarks.trim()} (by admin #${adminId})`,
      });
    }
    return row;
  },

  revoke: async ({ userId, period, remarks }, adminId) => {
    const key = period || periodOf(new Date());
    const row = await MemberQualification.findOne({
      where: { userId, period: key },
    });
    if (!row) throw new Error("No qualification record for that period");

    await row.update({
      isQualified: false,
      remarks: `REVOKED: ${remarks || "no reason given"} (by admin #${adminId})`,
    });
    return row;
  },

  /**
   * Backfill from historic PAID orders. Run once after creating the table,
   * otherwise every member looks unqualified for every past month and the
   * month-close job will forfeit commissions that were legitimately earned.
   */
  backfill: async ({ dryRun = false } = {}) => {
    const rows = await sequelize.query(
      `SELECT o.buyerUserId AS userId,
              DATE_FORMAT(o.createdAt, '%Y-%m') AS period,
              MIN(o.id)      AS orderId,
              SUM(o.totalPv) AS pv,
              MIN(o.createdAt) AS qualifiedAt
         FROM orders o
         JOIN order_items oi ON oi.orderId = o.id
         JOIN packages p     ON p.id = oi.packageId
        WHERE o.status = 'PAID'
          AND o.buyerUserId IS NOT NULL
          AND p.isQualifying = 1
        GROUP BY o.buyerUserId, DATE_FORMAT(o.createdAt, '%Y-%m')`,
      { type: QueryTypes.SELECT },
    );

    if (dryRun) return { wouldInsert: rows.length, sample: rows.slice(0, 10) };

    let inserted = 0;
    for (const r of rows) {
      const [, created] = await MemberQualification.findOrCreate({
        where: { userId: r.userId, period: r.period },
        defaults: {
          userId: r.userId,
          period: r.period,
          orderId: r.orderId,
          isQualified: true,
          qualifiedAt: r.qualifiedAt,
          pvAchieved: r.pv || 0,
          source: "ORDER",
          remarks: "Backfilled from historic orders",
        },
      });
      if (created) inserted += 1;
    }

    return { scanned: rows.length, inserted };
  },

  // ---------- reporting ----------
  getPeriodReport: async (period, q = {}) => {
    const key = period || periodOf(new Date());
    const { page, limit, offset } = getPagination(q);

    const where = { status: "ACTIVE", role: "MEMBER" };
    if (q.city) where.city = q.city;

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: ["id", "fullName", "phone", "city", "depth", "activatedAt"],
      include: [
        {
          model: MemberQualification,
          as: "qualifications",
          where: { period: key },
          required: q.qualified === "true" ? true : false,
          attributes: ["isQualified", "qualifiedAt", "pvAchieved", "source"],
        },
      ],
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });

    const data = rows.map((u) => {
      const j = u.toJSON();
      const q0 = j.qualifications && j.qualifications[0];
      return {
        userId: j.id,
        fullName: j.fullName,
        phone: j.phone,
        city: j.city,
        isQualified: q0 ? q0.isQualified : false,
        qualifiedAt: q0 ? q0.qualifiedAt : null,
        pvAchieved: q0 ? parseFloat(q0.pvAchieved) : 0,
        source: q0 ? q0.source : null,
      };
    });

    const filtered =
      q.qualified === "false" ? data.filter((d) => !d.isQualified) : data;

    return {
      period: key,
      data: filtered,
      meta: buildMeta({ count, page, limit }),
    };
  },

  getSummary: async (period) => {
    const key = period || periodOf(new Date());

    const [row] = await sequelize.query(
      `SELECT
         (SELECT COUNT(*) FROM users
           WHERE role = 'MEMBER' AND status = 'ACTIVE')          AS activeMembers,
         (SELECT COUNT(*) FROM member_qualifications
           WHERE period = :period AND isQualified = 1)           AS qualified,
         (SELECT COALESCE(SUM(pvAchieved), 0) FROM member_qualifications
           WHERE period = :period AND isQualified = 1)           AS totalPv`,
      { replacements: { period: key }, type: QueryTypes.SELECT },
    );

    const active = Number(row.activeMembers);
    const qualified = Number(row.qualified);

    return {
      period: key,
      activeMembers: active,
      qualified,
      unqualified: active - qualified,
      qualificationRate: active > 0 ? qualified / active : 0,
      totalPv: parseFloat(row.totalPv),
    };
  },
};

module.exports = qualificationRepository;