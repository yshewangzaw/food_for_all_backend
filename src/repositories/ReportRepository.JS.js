const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

// Reports are read-only aggregates over large tables. They are written as
// raw SQL on purpose — Sequelize's GROUP BY + include combination produces
// correlated subqueries that fall apart past a few thousand rows.

const num = (v) => Number(v || 0);
const money = (v) => parseFloat(v || 0);

// MySQL date grouping expression for ?groupBy=
const bucket = (groupBy, col = "createdAt") => {
  switch (groupBy) {
    case "week":
      return `DATE_FORMAT(${col}, '%x-W%v')`;
    case "month":
      return `DATE_FORMAT(${col}, '%Y-%m')`;
    case "year":
      return `DATE_FORMAT(${col}, '%Y')`;
    default:
      return `DATE(${col})`;
  }
};

const range = (q) => ({
  from: q.from || null,
  to: q.to || null,
});

const reportRepository = {
  // ==================== 8.1 Overview ====================
  getDashboard: async () => {
    const [r] = await sequelize.query(
      `SELECT
        (SELECT COUNT(*) FROM users WHERE role='MEMBER')                    AS totalMembers,
        (SELECT COUNT(*) FROM users WHERE role='MEMBER' AND status='ACTIVE') AS activeMembers,
        (SELECT COUNT(*) FROM users WHERE activatedAt IS NULL AND role='MEMBER') AS neverActivated,
        (SELECT COUNT(*) FROM users
          WHERE DATE(createdAt)=CURDATE())                                  AS signupsToday,
        (SELECT COALESCE(SUM(totalAmount),0) FROM orders
          WHERE status='PAID' AND DATE(createdAt)=CURDATE())                AS revenueToday,
        (SELECT COALESCE(SUM(totalAmount),0) FROM orders
          WHERE status='PAID'
            AND createdAt >= DATE_FORMAT(CURDATE(),'%Y-%m-01'))             AS revenueThisMonth,
        (SELECT COUNT(*) FROM payments WHERE status='SUBMITTED')            AS pendingPayments,
        (SELECT COALESCE(SUM(amount),0) FROM payments WHERE status='SUBMITTED') AS pendingPaymentValue,
        (SELECT COUNT(*) FROM withdrawal_requests
          WHERE status IN ('PENDING','UNDER_REVIEW'))                       AS pendingWithdrawals,
        (SELECT COALESCE(SUM(amount),0) FROM withdrawal_requests
          WHERE status IN ('PENDING','UNDER_REVIEW','APPROVED'))            AS pendingWithdrawalValue,
        (SELECT COALESCE(SUM(wallet),0) FROM users)                         AS walletAvailable,
        (SELECT COALESCE(SUM(lockedBalance),0) FROM users)                  AS walletLocked,
        (SELECT COALESCE(SUM(commissionAmount),0) FROM commissions
          WHERE status='PENDING')                                           AS pendingCommission,
        (SELECT COUNT(*) FROM kyc_documents WHERE status='PENDING')         AS pendingKyc`,
      { type: QueryTypes.SELECT },
    );

    return {
      members: {
        total: num(r.totalMembers),
        active: num(r.activeMembers),
        neverActivated: num(r.neverActivated),
        signupsToday: num(r.signupsToday),
      },
      revenue: {
        today: money(r.revenueToday),
        thisMonth: money(r.revenueThisMonth),
      },
      queues: {
        pendingPayments: num(r.pendingPayments),
        pendingPaymentValue: money(r.pendingPaymentValue),
        pendingWithdrawals: num(r.pendingWithdrawals),
        pendingWithdrawalValue: money(r.pendingWithdrawalValue),
        pendingKyc: num(r.pendingKyc),
      },
      liability: {
        walletAvailable: money(r.walletAvailable),
        walletLocked: money(r.walletLocked),
        pendingCommission: money(r.pendingCommission),
        total:
          money(r.walletAvailable) +
          money(r.walletLocked) +
          money(r.pendingCommission),
      },
    };
  },

  getDashboardTrends: async (days = 30) => {
    const rows = await sequelize.query(
      `SELECT DATE(d.day) AS date,
              COALESCE(o.revenue, 0) AS revenue,
              COALESCE(o.orders, 0)  AS orders,
              COALESCE(u.signups, 0) AS signups
         FROM (
           SELECT CURDATE() - INTERVAL n DAY AS day
             FROM (SELECT @r := @r + 1 AS n
                     FROM information_schema.columns,
                          (SELECT @r := -1) x
                    LIMIT :days) seq
         ) d
         LEFT JOIN (
           SELECT DATE(createdAt) AS day,
                  SUM(totalAmount) AS revenue, COUNT(*) AS orders
             FROM orders WHERE status='PAID' GROUP BY DATE(createdAt)
         ) o ON o.day = DATE(d.day)
         LEFT JOIN (
           SELECT DATE(createdAt) AS day, COUNT(*) AS signups
             FROM users GROUP BY DATE(createdAt)
         ) u ON u.day = DATE(d.day)
        ORDER BY date ASC`,
      { replacements: { days: Number(days) }, type: QueryTypes.SELECT },
    );

    return rows.map((r) => ({
      date: r.date,
      revenue: money(r.revenue),
      orders: num(r.orders),
      signups: num(r.signups),
    }));
  },

  // ==================== 8.2 Sales ====================
  getSales: async (q = {}) => {
    const b = bucket(q.groupBy, "o.createdAt");
    const rows = await sequelize.query(
      `SELECT ${b} AS period,
              COUNT(*)                       AS orderCount,
              COALESCE(SUM(o.totalAmount),0) AS revenue,
              COALESCE(SUM(o.totalPv),0)     AS pv,
              COALESCE(AVG(o.totalAmount),0) AS averageOrderValue
         FROM orders o
        WHERE o.status='PAID'
          AND (:from IS NULL OR o.createdAt >= :from)
          AND (:to   IS NULL OR o.createdAt <= :to)
        GROUP BY ${b}
        ORDER BY period ASC`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    return rows.map((r) => ({
      period: r.period,
      orderCount: num(r.orderCount),
      revenue: money(r.revenue),
      pv: money(r.pv),
      averageOrderValue: money(r.averageOrderValue),
    }));
  },

  getSalesByProduct: async (q = {}) => {
    const rows = await sequelize.query(
      `SELECT p.id, p.sku, p.name, p.category,
              SUM(oi.quantity)                    AS unitsSold,
              SUM(oi.unitPrice * oi.quantity)     AS revenue,
              SUM(oi.pvTotal)                     AS pv,
              COUNT(DISTINCT oi.orderId)          AS orderCount
         FROM order_items oi
         JOIN orders o   ON o.id = oi.orderId AND o.status='PAID'
         JOIN products p ON p.id = oi.productId
        WHERE (:from IS NULL OR o.createdAt >= :from)
          AND (:to   IS NULL OR o.createdAt <= :to)
        GROUP BY p.id, p.sku, p.name, p.category
        ORDER BY revenue DESC`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    return rows.map((r) => ({
      productId: r.id,
      sku: r.sku,
      name: r.name,
      category: r.category,
      unitsSold: num(r.unitsSold),
      revenue: money(r.revenue),
      pv: money(r.pv),
      orderCount: num(r.orderCount),
    }));
  },

  getSalesByPackage: async (q = {}) => {
    const rows = await sequelize.query(
      `SELECT pk.id, pk.code, pk.name, pk.isEntryPackage, pk.isQualifying,
              SUM(oi.quantity)                AS unitsSold,
              SUM(oi.unitPrice * oi.quantity) AS revenue,
              SUM(oi.pvTotal)                 AS pv
         FROM order_items oi
         JOIN orders o    ON o.id = oi.orderId AND o.status='PAID'
         JOIN packages pk ON pk.id = oi.packageId
        WHERE (:from IS NULL OR o.createdAt >= :from)
          AND (:to   IS NULL OR o.createdAt <= :to)
        GROUP BY pk.id, pk.code, pk.name, pk.isEntryPackage, pk.isQualifying
        ORDER BY revenue DESC`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    return rows.map((r) => ({
      packageId: r.id,
      code: r.code,
      name: r.name,
      isEntryPackage: !!r.isEntryPackage,
      isQualifying: !!r.isQualifying,
      unitsSold: num(r.unitsSold),
      revenue: money(r.revenue),
      pv: money(r.pv),
    }));
  },

  getSalesByOrderType: async (q = {}) => {
    const rows = await sequelize.query(
      `SELECT orderType,
              COUNT(*)                     AS orderCount,
              COALESCE(SUM(totalAmount),0) AS revenue,
              COALESCE(SUM(totalPv),0)     AS pv
         FROM orders
        WHERE status='PAID'
          AND (:from IS NULL OR createdAt >= :from)
          AND (:to   IS NULL OR createdAt <= :to)
        GROUP BY orderType`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    const total = rows.reduce((s, r) => s + money(r.revenue), 0);
    return rows.map((r) => ({
      orderType: r.orderType,
      orderCount: num(r.orderCount),
      revenue: money(r.revenue),
      pv: money(r.pv),
      share: total > 0 ? money(r.revenue) / total : 0,
    }));
  },

  getSalesByRegion: async (q = {}) => {
    const rows = await sequelize.query(
      `SELECT COALESCE(u.city, 'Unknown') AS city,
              COUNT(DISTINCT o.id)          AS orderCount,
              COUNT(DISTINCT u.id)          AS buyerCount,
              COALESCE(SUM(o.totalAmount),0) AS revenue
         FROM orders o
         JOIN users u ON u.id = o.buyerUserId
        WHERE o.status='PAID'
          AND (:from IS NULL OR o.createdAt >= :from)
          AND (:to   IS NULL OR o.createdAt <= :to)
        GROUP BY COALESCE(u.city, 'Unknown')
        ORDER BY revenue DESC`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    return rows.map((r) => ({
      city: r.city,
      orderCount: num(r.orderCount),
      buyerCount: num(r.buyerCount),
      revenue: money(r.revenue),
    }));
  },

  getSalesByPaymentMethod: async (q = {}) => {
    const rows = await sequelize.query(
      `SELECT pm.id, pm.name, pm.methodType,
              COUNT(p.id)                  AS paymentCount,
              COALESCE(SUM(p.amount),0)    AS totalReceived
         FROM payments p
         JOIN payment_methods pm ON pm.id = p.paymentMethodId
        WHERE p.status='APPROVED'
          AND (:from IS NULL OR p.createdAt >= :from)
          AND (:to   IS NULL OR p.createdAt <= :to)
        GROUP BY pm.id, pm.name, pm.methodType
        ORDER BY totalReceived DESC`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    return rows.map((r) => ({
      paymentMethodId: r.id,
      name: r.name,
      methodType: r.methodType,
      paymentCount: num(r.paymentCount),
      totalReceived: money(r.totalReceived),
    }));
  },

  // ==================== 8.3 Commissions ====================
  getCommissionSummary: async (q = {}) => {
    const [r] = await sequelize.query(
      `SELECT
         COUNT(*)                                                      AS totalRecords,
         COALESCE(SUM(commissionAmount),0)                             AS totalGenerated,
         COALESCE(SUM(CASE WHEN status='CREDITED' THEN commissionAmount END),0) AS credited,
         COALESCE(SUM(CASE WHEN status='PENDING'  THEN commissionAmount END),0) AS pending,
         COALESCE(SUM(CASE WHEN status='REVERSED' THEN commissionAmount END),0) AS reversed,
         COALESCE(SUM(CASE WHEN forfeitReason IS NOT NULL
                           THEN commissionAmount END),0)               AS forfeited,
         COUNT(DISTINCT beneficiaryUserId)                             AS earnerCount
        FROM commissions
       WHERE (:from IS NULL OR createdAt >= :from)
         AND (:to   IS NULL OR createdAt <= :to)`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    return {
      totalRecords: num(r.totalRecords),
      totalGenerated: money(r.totalGenerated),
      credited: money(r.credited),
      pending: money(r.pending),
      reversed: money(r.reversed),
      forfeited: money(r.forfeited),
      earnerCount: num(r.earnerCount),
    };
  },

  getCommissionByLevel: async (q = {}) => {
    const rows = await sequelize.query(
      `SELECT COALESCE(levelId, 0) AS level,
              COUNT(*)                          AS payoutCount,
              COALESCE(SUM(commissionAmount),0) AS totalAmount,
              COALESCE(AVG(commissionAmount),0) AS averageAmount,
              COUNT(DISTINCT beneficiaryUserId) AS earnerCount
         FROM commissions
        WHERE status <> 'REVERSED'
          AND (:from IS NULL OR createdAt >= :from)
          AND (:to   IS NULL OR createdAt <= :to)
        GROUP BY COALESCE(levelId, 0)
        ORDER BY level ASC`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    const total = rows.reduce((s, r) => s + money(r.totalAmount), 0);
    return rows.map((r) => ({
      level: num(r.level),
      payoutCount: num(r.payoutCount),
      totalAmount: money(r.totalAmount),
      averageAmount: money(r.averageAmount),
      earnerCount: num(r.earnerCount),
      share: total > 0 ? money(r.totalAmount) / total : 0,
    }));
  },

  getCommissionByType: async (q = {}) => {
    const rows = await sequelize.query(
      `SELECT commissionType,
              COUNT(*)                          AS payoutCount,
              COALESCE(SUM(commissionAmount),0) AS totalAmount
         FROM commissions
        WHERE status <> 'REVERSED'
          AND (:from IS NULL OR createdAt >= :from)
          AND (:to   IS NULL OR createdAt <= :to)
        GROUP BY commissionType`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    return rows.map((r) => ({
      commissionType: r.commissionType,
      payoutCount: num(r.payoutCount),
      totalAmount: money(r.totalAmount),
    }));
  },

  getTopEarners: async (q = {}) => {
    const rows = await sequelize.query(
      `SELECT u.id, u.fullName, u.phone, u.city, u.depth,
              u.directReferralCount,
              COUNT(c.id)                         AS payoutCount,
              COALESCE(SUM(c.commissionAmount),0) AS totalEarned
         FROM commissions c
         JOIN users u ON u.id = c.beneficiaryUserId
        WHERE c.status <> 'REVERSED'
          AND (:from IS NULL OR c.createdAt >= :from)
          AND (:to   IS NULL OR c.createdAt <= :to)
        GROUP BY u.id, u.fullName, u.phone, u.city, u.depth, u.directReferralCount
        ORDER BY totalEarned DESC
        LIMIT :limit`,
      {
        replacements: { ...range(q), limit: Number(q.limit) || 20 },
        type: QueryTypes.SELECT,
      },
    );

    return rows.map((r, i) => ({
      rank: i + 1,
      userId: r.id,
      fullName: r.fullName,
      phone: r.phone,
      city: r.city,
      depth: num(r.depth),
      directReferrals: num(r.directReferralCount),
      payoutCount: num(r.payoutCount),
      totalEarned: money(r.totalEarned),
    }));
  },

  /**
   * The number that decides whether the compensation plan survives.
   * Revenue in vs commission out, per period. Watch it every month.
   */
  getMargin: async (q = {}) => {
    const b = bucket(q.groupBy || "month", "createdAt");

    const revenue = await sequelize.query(
      `SELECT ${b} AS period, COALESCE(SUM(totalAmount),0) AS revenue
         FROM orders
        WHERE status='PAID'
          AND (:from IS NULL OR createdAt >= :from)
          AND (:to   IS NULL OR createdAt <= :to)
        GROUP BY ${b}`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    const payout = await sequelize.query(
      `SELECT ${b} AS period, COALESCE(SUM(commissionAmount),0) AS commission
         FROM commissions
        WHERE status <> 'REVERSED'
          AND (:from IS NULL OR createdAt >= :from)
          AND (:to   IS NULL OR createdAt <= :to)
        GROUP BY ${b}`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    const map = {};
    for (const r of revenue) {
      map[r.period] = { period: r.period, revenue: money(r.revenue), commission: 0 };
    }
    for (const c of payout) {
      if (!map[c.period]) {
        map[c.period] = { period: c.period, revenue: 0, commission: 0 };
      }
      map[c.period].commission = money(c.commission);
    }

    return Object.values(map)
      .sort((a, b2) => String(a.period).localeCompare(String(b2.period)))
      .map((r) => ({
        ...r,
        grossMargin: r.revenue - r.commission,
        payoutRatio: r.revenue > 0 ? r.commission / r.revenue : 0,
      }));
  },

  getForfeited: async (q = {}) => {
    const rows = await sequelize.query(
      `SELECT u.id AS userId, u.fullName, u.phone,
              COUNT(c.id)                         AS forfeitCount,
              COALESCE(SUM(c.commissionAmount),0) AS forfeitedAmount
         FROM commissions c
         JOIN users u ON u.id = c.beneficiaryUserId
        WHERE c.forfeitReason IS NOT NULL
          AND (:from IS NULL OR c.createdAt >= :from)
          AND (:to   IS NULL OR c.createdAt <= :to)
        GROUP BY u.id, u.fullName, u.phone
        ORDER BY forfeitedAmount DESC`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    return {
      totalForfeited: rows.reduce((s, r) => s + money(r.forfeitedAmount), 0),
      affectedMembers: rows.length,
      breakdown: rows.map((r) => ({
        userId: r.userId,
        fullName: r.fullName,
        phone: r.phone,
        forfeitCount: num(r.forfeitCount),
        forfeitedAmount: money(r.forfeitedAmount),
      })),
    };
  },

  // ==================== 8.4 Network & members ====================
  getNetworkGrowth: async (q = {}) => {
    const b = bucket(q.groupBy || "day", "createdAt");
    const rows = await sequelize.query(
      `SELECT ${b} AS period,
              COUNT(*)                                                AS signups,
              SUM(CASE WHEN activatedAt IS NOT NULL THEN 1 ELSE 0 END) AS activated
         FROM users
        WHERE role='MEMBER'
          AND (:from IS NULL OR createdAt >= :from)
          AND (:to   IS NULL OR createdAt <= :to)
        GROUP BY ${b}
        ORDER BY period ASC`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    let running = 0;
    return rows.map((r) => {
      running += num(r.signups);
      return {
        period: r.period,
        signups: num(r.signups),
        activated: num(r.activated),
        activationRate: num(r.signups) > 0 ? num(r.activated) / num(r.signups) : 0,
        cumulativeMembers: running,
      };
    });
  },

  getDepthDistribution: async () => {
    const rows = await sequelize.query(
      `SELECT depth,
              COUNT(*)                                            AS total,
              SUM(CASE WHEN status='ACTIVE' THEN 1 ELSE 0 END)    AS active
         FROM users
        WHERE role='MEMBER'
        GROUP BY depth
        ORDER BY depth ASC`,
      { type: QueryTypes.SELECT },
    );

    return rows.map((r) => ({
      depth: num(r.depth),
      total: num(r.total),
      active: num(r.active),
      inactive: num(r.total) - num(r.active),
    }));
  },

  getActiveRatio: async () => {
    const rows = await sequelize.query(
      `SELECT status, COUNT(*) AS count
         FROM users WHERE role='MEMBER'
        GROUP BY status`,
      { type: QueryTypes.SELECT },
    );
    const total = rows.reduce((s, r) => s + num(r.count), 0);
    return {
      total,
      breakdown: rows.map((r) => ({
        status: r.status,
        count: num(r.count),
        share: total > 0 ? num(r.count) / total : 0,
      })),
    };
  },

  getInactiveMembers: async (months = 2) => {
    const rows = await sequelize.query(
      `SELECT u.id, u.fullName, u.phone, u.city, u.status,
              u.activatedAt, u.directReferralCount,
              MAX(mq.period) AS lastQualifiedPeriod
         FROM users u
         LEFT JOIN member_qualifications mq
                ON mq.userId = u.id AND mq.isQualified = 1
        WHERE u.role='MEMBER' AND u.activatedAt IS NOT NULL
        GROUP BY u.id, u.fullName, u.phone, u.city, u.status,
                 u.activatedAt, u.directReferralCount
       HAVING lastQualifiedPeriod IS NULL
           OR lastQualifiedPeriod < DATE_FORMAT(
                DATE_SUB(CURDATE(), INTERVAL :months MONTH), '%Y-%m')
        ORDER BY lastQualifiedPeriod ASC`,
      { replacements: { months: Number(months) }, type: QueryTypes.SELECT },
    );

    return rows.map((r) => ({
      userId: r.id,
      fullName: r.fullName,
      phone: r.phone,
      city: r.city,
      status: r.status,
      activatedAt: r.activatedAt,
      directReferrals: num(r.directReferralCount),
      lastQualifiedPeriod: r.lastQualifiedPeriod,
    }));
  },

  getChurn: async (q = {}) => {
    const b = bucket(q.groupBy || "month", "u.createdAt");
    const rows = await sequelize.query(
      `SELECT ${b} AS period,
              SUM(CASE WHEN u.activatedAt IS NOT NULL THEN 1 ELSE 0 END) AS activated,
              SUM(CASE WHEN u.status='INACTIVE' THEN 1 ELSE 0 END)       AS goneInactive,
              SUM(CASE WHEN u.status IN ('SUSPENDED','BLOCKED')
                       THEN 1 ELSE 0 END)                                AS suspended
         FROM users u
        WHERE u.role='MEMBER'
          AND (:from IS NULL OR u.createdAt >= :from)
          AND (:to   IS NULL OR u.createdAt <= :to)
        GROUP BY ${b}
        ORDER BY period ASC`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    return rows.map((r) => ({
      period: r.period,
      activated: num(r.activated),
      goneInactive: num(r.goneInactive),
      suspended: num(r.suspended),
      churnRate:
        num(r.activated) > 0 ? num(r.goneInactive) / num(r.activated) : 0,
    }));
  },

  getNewMembers: async (q = {}) => {
    const rows = await sequelize.query(
      `SELECT u.id, u.fullName, u.phone, u.city, u.status, u.createdAt,
              u.activatedAt, u.depth,
              s.id AS sponsorId, s.fullName AS sponsorName
         FROM users u
         LEFT JOIN users s ON s.id = u.sponsorId
        WHERE u.role='MEMBER'
          AND (:from IS NULL OR u.createdAt >= :from)
          AND (:to   IS NULL OR u.createdAt <= :to)
        ORDER BY u.createdAt DESC
        LIMIT 1000`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );
    return rows;
  },

  getRecruiterLeaderboard: async (q = {}) => {
    const rows = await sequelize.query(
      `SELECT s.id, s.fullName, s.phone, s.city,
              COUNT(u.id) AS newActivated
         FROM users s
         JOIN users u ON u.sponsorId = s.id
        WHERE u.activatedAt IS NOT NULL
          AND (:from IS NULL OR u.activatedAt >= :from)
          AND (:to   IS NULL OR u.activatedAt <= :to)
        GROUP BY s.id, s.fullName, s.phone, s.city
        ORDER BY newActivated DESC
        LIMIT :limit`,
      {
        replacements: { ...range(q), limit: Number(q.limit) || 20 },
        type: QueryTypes.SELECT,
      },
    );

    return rows.map((r, i) => ({
      rank: i + 1,
      userId: r.id,
      fullName: r.fullName,
      phone: r.phone,
      city: r.city,
      newActivated: num(r.newActivated),
    }));
  },

  // ==================== 8.5 Money & compliance ====================
  getWithdrawalSummary: async (q = {}) => {
    const [r] = await sequelize.query(
      `SELECT
         COUNT(*)                                                        AS totalRequests,
         COALESCE(SUM(amount),0)                                         AS totalRequested,
         COALESCE(SUM(CASE WHEN status='PAID'     THEN amount END),0)    AS totalPaid,
         COALESCE(SUM(CASE WHEN status='REJECTED' THEN amount END),0)    AS totalRejected,
         COALESCE(SUM(CASE WHEN status IN ('PENDING','UNDER_REVIEW','APPROVED')
                           THEN amount END),0)                           AS totalPending,
         COUNT(CASE WHEN status='PAID' THEN 1 END)                       AS paidCount,
         COALESCE(AVG(CASE WHEN status='PAID'
                      THEN TIMESTAMPDIFF(HOUR, createdAt, paidAt) END),0) AS avgTurnaroundHours
        FROM withdrawal_requests
       WHERE (:from IS NULL OR createdAt >= :from)
         AND (:to   IS NULL OR createdAt <= :to)`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    return {
      totalRequests: num(r.totalRequests),
      totalRequested: money(r.totalRequested),
      totalPaid: money(r.totalPaid),
      totalRejected: money(r.totalRejected),
      totalPending: money(r.totalPending),
      paidCount: num(r.paidCount),
      averageTurnaroundHours: Math.round(num(r.avgTurnaroundHours)),
    };
  },

  // Surfaces anything stuck in the queue.
  getWithdrawalAging: async () => {
    const rows = await sequelize.query(
      `SELECT
         CASE
           WHEN TIMESTAMPDIFF(HOUR, createdAt, NOW()) < 24  THEN '0-24h'
           WHEN TIMESTAMPDIFF(HOUR, createdAt, NOW()) < 72  THEN '1-3d'
           WHEN TIMESTAMPDIFF(HOUR, createdAt, NOW()) < 168 THEN '3-7d'
           ELSE '7d+'
         END AS bucket,
         COUNT(*)                AS count,
         COALESCE(SUM(amount),0) AS totalAmount,
         MAX(TIMESTAMPDIFF(HOUR, createdAt, NOW())) AS oldestHours
       FROM withdrawal_requests
      WHERE status IN ('PENDING','UNDER_REVIEW','APPROVED')
      GROUP BY bucket
      ORDER BY oldestHours ASC`,
      { type: QueryTypes.SELECT },
    );

    return rows.map((r) => ({
      bucket: r.bucket,
      count: num(r.count),
      totalAmount: money(r.totalAmount),
      oldestHours: num(r.oldestHours),
    }));
  },

  getPaymentReconciliation: async (q = {}) => {
    const rows = await sequelize.query(
      `SELECT pm.id, pm.name, pm.code, pm.methodType,
              COUNT(p.id)                     AS paymentCount,
              COALESCE(SUM(p.amount),0)       AS paymentTotal,
              COALESCE(SUM(o.totalAmount),0)  AS orderTotal
         FROM payments p
         JOIN payment_methods pm ON pm.id = p.paymentMethodId
         JOIN orders o           ON o.id  = p.orderId
        WHERE p.status='APPROVED'
          AND (:from IS NULL OR p.reviewedAt >= :from)
          AND (:to   IS NULL OR p.reviewedAt <= :to)
        GROUP BY pm.id, pm.name, pm.code, pm.methodType`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    return rows.map((r) => ({
      paymentMethodId: r.id,
      name: r.name,
      code: r.code,
      methodType: r.methodType,
      paymentCount: num(r.paymentCount),
      paymentTotal: money(r.paymentTotal),
      orderTotal: money(r.orderTotal),
      // non-zero means a payment amount didn't match its order — investigate
      variance: money(r.paymentTotal) - money(r.orderTotal),
      balanced: Math.abs(money(r.paymentTotal) - money(r.orderTotal)) < 0.01,
    }));
  },

  getPaymentRejectionReasons: async (q = {}) => {
    const rows = await sequelize.query(
      `SELECT COALESCE(rejectionReason,'(none given)') AS reason,
              COUNT(*)                AS count,
              COALESCE(SUM(amount),0) AS totalAmount
         FROM payments
        WHERE status='REJECTED'
          AND (:from IS NULL OR reviewedAt >= :from)
          AND (:to   IS NULL OR reviewedAt <= :to)
        GROUP BY COALESCE(rejectionReason,'(none given)')
        ORDER BY count DESC`,
      { replacements: range(q), type: QueryTypes.SELECT },
    );

    return rows.map((r) => ({
      reason: r.reason,
      count: num(r.count),
      totalAmount: money(r.totalAmount),
    }));
  },

  getKycSummary: async () => {
    const rows = await sequelize.query(
      `SELECT status,
              COUNT(*) AS count,
              COALESCE(AVG(TIMESTAMPDIFF(HOUR, createdAt, updatedAt)),0) AS avgReviewHours
         FROM kyc_documents
        GROUP BY status`,
      { type: QueryTypes.SELECT },
    );

    const total = rows.reduce((s, r) => s + num(r.count), 0);
    return {
      total,
      breakdown: rows.map((r) => ({
        status: r.status,
        count: num(r.count),
        share: total > 0 ? num(r.count) / total : 0,
        averageReviewHours: Math.round(num(r.avgReviewHours)),
      })),
    };
  },

  // ==================== 8.6 Member-facing ====================
  getMemberDashboard: async (userId) => {
    const [r] = await sequelize.query(
      `SELECT
         (SELECT wallet FROM users WHERE id=:userId)                     AS available,
         (SELECT lockedBalance FROM users WHERE id=:userId)              AS locked,
         (SELECT COALESCE(SUM(commissionAmount),0) FROM commissions
           WHERE beneficiaryUserId=:userId AND status='CREDITED'
             AND createdAt >= DATE_FORMAT(CURDATE(),'%Y-%m-01'))         AS earnedThisMonth,
         (SELECT COALESCE(SUM(commissionAmount),0) FROM commissions
           WHERE beneficiaryUserId=:userId AND status='CREDITED')        AS lifetimeEarned,
         (SELECT COALESCE(SUM(commissionAmount),0) FROM commissions
           WHERE beneficiaryUserId=:userId AND status='PENDING')         AS pendingCommission,
         (SELECT COUNT(*) FROM network_paths
           WHERE ancestorId=:userId AND level > 0)                       AS downlineSize,
         (SELECT directReferralCount FROM users WHERE id=:userId)        AS directReferrals,
         (SELECT COUNT(*) FROM notifications
           WHERE userId=:userId AND isRead=0)                            AS unreadNotifications,
         (SELECT COUNT(*) FROM withdrawal_requests
           WHERE userId=:userId
             AND status IN ('PENDING','UNDER_REVIEW','APPROVED'))        AS pendingWithdrawals`,
      { replacements: { userId }, type: QueryTypes.SELECT },
    );

    return {
      wallet: {
        available: money(r.available),
        locked: money(r.locked),
        total: money(r.available) + money(r.locked),
      },
      earnings: {
        thisMonth: money(r.earnedThisMonth),
        lifetime: money(r.lifetimeEarned),
        pending: money(r.pendingCommission),
      },
      network: {
        downlineSize: num(r.downlineSize),
        directReferrals: num(r.directReferrals),
      },
      alerts: {
        unreadNotifications: num(r.unreadNotifications),
        pendingWithdrawals: num(r.pendingWithdrawals),
      },
    };
  },

  getMemberEarnings: async (userId, q = {}) => {
    const b = bucket(q.groupBy || "month", "createdAt");
    const rows = await sequelize.query(
      `SELECT ${b} AS period,
              COUNT(*)                          AS payoutCount,
              COALESCE(SUM(commissionAmount),0) AS earned
         FROM commissions
        WHERE beneficiaryUserId=:userId AND status <> 'REVERSED'
          AND (:from IS NULL OR createdAt >= :from)
          AND (:to   IS NULL OR createdAt <= :to)
        GROUP BY ${b}
        ORDER BY period ASC`,
      { replacements: { userId, ...range(q) }, type: QueryTypes.SELECT },
    );

    return rows.map((r) => ({
      period: r.period,
      payoutCount: num(r.payoutCount),
      earned: money(r.earned),
    }));
  },

  getMemberEarningsByLevel: async (userId, q = {}) => {
    const rows = await sequelize.query(
      `SELECT COALESCE(levelId, 0) AS level,
              COUNT(*)                          AS payoutCount,
              COALESCE(SUM(commissionAmount),0) AS earned
         FROM commissions
        WHERE beneficiaryUserId=:userId AND status <> 'REVERSED'
          AND (:from IS NULL OR createdAt >= :from)
          AND (:to   IS NULL OR createdAt <= :to)
        GROUP BY COALESCE(levelId, 0)
        ORDER BY level ASC`,
      { replacements: { userId, ...range(q) }, type: QueryTypes.SELECT },
    );

    const total = rows.reduce((s, r) => s + money(r.earned), 0);
    return rows.map((r) => ({
      level: num(r.level),
      payoutCount: num(r.payoutCount),
      earned: money(r.earned),
      share: total > 0 ? money(r.earned) / total : 0,
    }));
  },

  getMemberNetworkGrowth: async (userId, q = {}) => {
    const b = bucket(q.groupBy || "month", "u.createdAt");
    const rows = await sequelize.query(
      `SELECT ${b} AS period,
              COUNT(*)                                                AS joined,
              SUM(CASE WHEN u.activatedAt IS NOT NULL THEN 1 ELSE 0 END) AS activated
         FROM network_paths np
         JOIN users u ON u.id = np.descendantId
        WHERE np.ancestorId=:userId AND np.level > 0
        GROUP BY ${b}
        ORDER BY period ASC`,
      { replacements: { userId }, type: QueryTypes.SELECT },
    );

    let running = 0;
    return rows.map((r) => {
      running += num(r.joined);
      return {
        period: r.period,
        joined: num(r.joined),
        activated: num(r.activated),
        cumulative: running,
      };
    });
  },

  getTeamPerformance: async (userId, period) => {
    const key =
      period ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

    const rows = await sequelize.query(
      `SELECT u.id, u.fullName, u.phone, u.city, u.status,
              np.level,
              u.directReferralCount,
              CASE WHEN mq.isQualified = 1 THEN 1 ELSE 0 END AS qualifiedThisPeriod,
              COALESCE(oc.orderTotal, 0) AS purchasedThisPeriod,
              COALESCE(cc.generated, 0)  AS commissionGeneratedForMe
         FROM network_paths np
         JOIN users u ON u.id = np.descendantId
         LEFT JOIN member_qualifications mq
                ON mq.userId = u.id AND mq.period = :period
         LEFT JOIN (
           SELECT buyerUserId, SUM(totalAmount) AS orderTotal
             FROM orders
            WHERE status='PAID'
              AND DATE_FORMAT(createdAt,'%Y-%m') = :period
            GROUP BY buyerUserId
         ) oc ON oc.buyerUserId = u.id
         LEFT JOIN (
           SELECT sourceUserId, SUM(commissionAmount) AS generated
             FROM commissions
            WHERE beneficiaryUserId = :userId AND status <> 'REVERSED'
            GROUP BY sourceUserId
         ) cc ON cc.sourceUserId = u.id
        WHERE np.ancestorId = :userId AND np.level > 0
        ORDER BY np.level ASC, commissionGeneratedForMe DESC`,
      { replacements: { userId, period: key }, type: QueryTypes.SELECT },
    );

    return {
      period: key,
      teamSize: rows.length,
      qualified: rows.filter((r) => num(r.qualifiedThisPeriod) === 1).length,
      members: rows.map((r) => ({
        userId: r.id,
        fullName: r.fullName,
        phone: r.phone,
        city: r.city,
        status: r.status,
        level: num(r.level),
        directReferrals: num(r.directReferralCount),
        qualifiedThisPeriod: num(r.qualifiedThisPeriod) === 1,
        purchasedThisPeriod: money(r.purchasedThisPeriod),
        commissionGeneratedForMe: money(r.commissionGeneratedForMe),
      })),
    };
  },

  getMemberPurchases: async (userId, q = {}) => {
    const rows = await sequelize.query(
      `SELECT id, orderNumber, orderType, totalAmount, totalPv, status, createdAt
         FROM orders
        WHERE buyerUserId=:userId
          AND (:from IS NULL OR createdAt >= :from)
          AND (:to   IS NULL OR createdAt <= :to)
        ORDER BY createdAt DESC`,
      { replacements: { userId, ...range(q) }, type: QueryTypes.SELECT },
    );

    return {
      orderCount: rows.length,
      totalSpent: rows
        .filter((r) => r.status === "PAID")
        .reduce((s, r) => s + money(r.totalAmount), 0),
      totalPv: rows
        .filter((r) => r.status === "PAID")
        .reduce((s, r) => s + money(r.totalPv), 0),
      orders: rows,
    };
  },
};

module.exports = reportRepository;