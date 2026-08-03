const {
  User,
  Order,
  Commission,
  Notification,
  MemberQualification,
  WalletTransaction,
} = require("../models");
const sequelize = require("../config/database");
const { Op, QueryTypes } = require("sequelize");
const jobRunner = require("./jobRunner");
const qualificationRepository = require("../repositories/qualificationRepository");
const walletRepository = require("../repositories/walletExtendedRepository");
const networkAdminRepository = require("../repositories/networkAdminRepository");

const periodOf = (date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const prevPeriod = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return periodOf(d);
};

// ============================================================
// 1. Qualification run — closes the month
// ============================================================
// Marks who qualified, then forfeits commissions whose beneficiary did not.
// Idempotent: a commission already carrying a forfeitReason is skipped, so
// running this twice for 2026-07 cannot double-forfeit.
const qualificationRun = async (params, ctx) => {
  const period = params.period || prevPeriod();
  const dryRun = params.dryRun === true || params.dryRun === "true";

  const [y, m] = period.split("-").map(Number);
  const periodStart = new Date(y, m - 1, 1);
  const periodEnd = new Date(y, m, 1);

  // Everyone who bought a qualifying package in the window
  const qualifyingOrders = await sequelize.query(
    `SELECT o.buyerUserId AS userId, MIN(o.id) AS orderId, SUM(o.totalPv) AS pv
       FROM orders o
       JOIN order_items oi ON oi.orderId = o.id
       JOIN packages p     ON p.id = oi.packageId
      WHERE o.status = 'PAID'
        AND o.buyerUserId IS NOT NULL
        AND p.isQualifying = 1
        AND o.createdAt >= :start AND o.createdAt < :end
      GROUP BY o.buyerUserId`,
    {
      replacements: { start: periodStart, end: periodEnd },
      type: QueryTypes.SELECT,
    },
  );

  ctx.progress(0, qualifyingOrders.length, "recording qualifications");

  let recorded = 0;
  if (!dryRun) {
    for (const row of qualifyingOrders) {
      if (ctx.isCancelled()) break;
      await qualificationRepository.record({
        userId: row.userId,
        orderId: row.orderId,
        pv: row.pv,
        period,
      });
      recorded += 1;
      if (recorded % 100 === 0) {
        ctx.progress(recorded, qualifyingOrders.length, "recording");
      }
    }
  }

  // Forfeit PENDING commissions whose beneficiary did not qualify
  const pending = await Commission.findAll({
    where: {
      status: "PENDING",
      forfeitReason: { [Op.is]: null },
      createdAt: { [Op.gte]: periodStart, [Op.lt]: periodEnd },
    },
    attributes: ["id", "beneficiaryUserId", "commissionAmount"],
    raw: true,
  });

  const beneficiaryIds = [...new Set(pending.map((c) => c.beneficiaryUserId))];
  const qualifiedMap = await qualificationRepository.areQualified(
    beneficiaryIds,
    period,
  );

  const toForfeit = pending.filter((c) => !qualifiedMap[c.beneficiaryUserId]);
  const forfeitedValue = toForfeit.reduce(
    (s, c) => s + parseFloat(c.commissionAmount),
    0,
  );

  if (!dryRun && toForfeit.length) {
    await Commission.update(
      {
        forfeitReason: `Beneficiary not qualified for ${period}`,
        status: "REVERSED",
      },
      { where: { id: { [Op.in]: toForfeit.map((c) => c.id) } } },
    );
  }

  return {
    period,
    dryRun,
    qualifiedMembers: qualifyingOrders.length,
    qualificationsRecorded: recorded,
    commissionsChecked: pending.length,
    commissionsForfeited: toForfeit.length,
    forfeitedValue,
  };
};

// ============================================================
// 2. Deactivate lapsed members
// ============================================================
const deactivateLapsed = async (params, ctx) => {
  const period = params.period || prevPeriod();
  const dryRun = params.dryRun === true || params.dryRun === "true";

  const lapsed = await sequelize.query(
    `SELECT u.id, u.fullName, u.phone
       FROM users u
       LEFT JOIN member_qualifications mq
              ON mq.userId = u.id AND mq.period = :period AND mq.isQualified = 1
      WHERE u.role = 'MEMBER'
        AND u.status = 'ACTIVE'
        AND u.activatedAt IS NOT NULL
        AND mq.id IS NULL`,
    { replacements: { period }, type: QueryTypes.SELECT },
  );

  ctx.progress(0, lapsed.length, "deactivating");

  if (!dryRun && lapsed.length) {
    await User.update(
      { status: "INACTIVE" },
      { where: { id: { [Op.in]: lapsed.map((u) => u.id) } } },
    );

    await Notification.bulkCreate(
      lapsed.map((u) => ({
        userId: u.id,
        category: "SYSTEM",
        title: "Account marked inactive",
        body: `You did not make a qualifying purchase for ${period}. Buy a qualifying package to reactivate.`,
        isRead: false,
      })),
    );
  }

  return {
    period,
    dryRun,
    deactivated: lapsed.length,
    members: lapsed.slice(0, 100),
  };
};

// ============================================================
// 3. Batch-credit pending commissions
// ============================================================
// Only credits beneficiaries who qualified — an unqualified member's
// commission should already have been forfeited by job 1, but this
// double-checks rather than trusting run order.
const commissionBatchCredit = async (params, ctx) => {
  const period = params.period || prevPeriod();
  const dryRun = params.dryRun === true || params.dryRun === "true";

  const [y, m] = period.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  const pending = await Commission.findAll({
    where: {
      status: "PENDING",
      forfeitReason: { [Op.is]: null },
      createdAt: { [Op.gte]: start, [Op.lt]: end },
    },
    raw: true,
  });

  const ids = [...new Set(pending.map((c) => c.beneficiaryUserId))];
  const qualified = await qualificationRepository.areQualified(ids, period);

  const eligible = pending.filter((c) => qualified[c.beneficiaryUserId]);
  const totalValue = eligible.reduce(
    (s, c) => s + parseFloat(c.commissionAmount),
    0,
  );

  if (dryRun) {
    return {
      period,
      dryRun: true,
      wouldCredit: eligible.length,
      wouldCreditValue: totalValue,
      skippedUnqualified: pending.length - eligible.length,
    };
  }

  ctx.progress(0, eligible.length, "crediting");

  let credited = 0;
  let failed = 0;
  const errors = [];

  for (const c of eligible) {
    if (ctx.isCancelled()) break;
    const t = await sequelize.transaction();
    try {
      // the unique index on (referenceType, referenceId, transactionType)
      // is what actually guarantees no double credit
      await walletRepository.postTransaction(
        {
          userId: c.beneficiaryUserId,
          transactionType: "COMMISSION_CREDIT",
          direction: "CREDIT",
          amount: c.commissionAmount,
          referenceType: "COMMISSION",
          referenceId: c.id,
          description: `Commission credited for ${period}`,
          affects: "available",
        },
        t,
      );

      await Commission.update(
        { status: "CREDITED", creditedAt: new Date() },
        { where: { id: c.id }, transaction: t },
      );

      await Notification.create(
        {
          userId: c.beneficiaryUserId,
          category: "COMMISSION",
          title: "Commission credited",
          body: `${c.commissionAmount} has been added to your wallet for ${period}.`,
          isRead: false,
        },
        { transaction: t },
      );

      await t.commit();
      credited += 1;
    } catch (error) {
      await t.rollback();
      failed += 1;
      if (errors.length < 20) {
        errors.push({ commissionId: c.id, message: error.message });
      }
    }

    if ((credited + failed) % 50 === 0) {
      ctx.progress(credited + failed, eligible.length, "crediting");
    }
  }

  return {
    period,
    dryRun: false,
    credited,
    failed,
    creditedValue: totalValue,
    skippedUnqualified: pending.length - eligible.length,
    errors,
  };
};

// ============================================================
// 4. Network rebuild
// ============================================================
const networkRebuild = async (params, ctx) => {
  ctx.progress(0, null, "rebuilding closure table");
  if (params.userId) {
    return await networkAdminRepository.rebuildSubtree(params.userId);
  }
  return await networkAdminRepository.rebuildAll();
};

// ============================================================
// 5. Wallet reconcile
// ============================================================
const walletReconcile = async (params, ctx) => {
  ctx.progress(0, null, "comparing balances against ledger");
  const result = await walletRepository.reconcile();

  if (!result.healthy) {
    console.error(
      `[walletReconcile] DRIFT DETECTED: ${result.balanceDrift.length} balance, ${result.lockDrift.length} lock`,
    );
  }
  return result;
};

// ============================================================
// 6. Qualification reminder
// ============================================================
const qualificationReminder = async (params, ctx) => {
  const period = params.period || periodOf();
  const dryRun = params.dryRun === true || params.dryRun === "true";

  const [y, m] = period.split("-").map(Number);
  const periodEnd = new Date(y, m, 0);
  const daysLeft = Math.ceil((periodEnd - new Date()) / (1000 * 60 * 60 * 24));

  const unqualified = await sequelize.query(
    `SELECT u.id, u.fullName
       FROM users u
       LEFT JOIN member_qualifications mq
              ON mq.userId = u.id AND mq.period = :period AND mq.isQualified = 1
      WHERE u.role='MEMBER' AND u.status='ACTIVE' AND mq.id IS NULL`,
    { replacements: { period }, type: QueryTypes.SELECT },
  );

  if (!dryRun && unqualified.length) {
    const CHUNK = 1000;
    for (let i = 0; i < unqualified.length; i += CHUNK) {
      await Notification.bulkCreate(
        unqualified.slice(i, i + CHUNK).map((u) => ({
          userId: u.id,
          category: "SYSTEM",
          title: "Monthly purchase reminder",
          body: `You have ${daysLeft} day(s) left to make your qualifying purchase for ${period}.`,
          linkUrl: "/packages/qualifying",
          isRead: false,
        })),
      );
      ctx.progress(i, unqualified.length, "notifying");
    }
  }

  return { period, dryRun, daysLeft, notified: unqualified.length };
};

// ============================================================
// 7. Expire stale unpaid orders
// ============================================================
const paymentExpiry = async (params, ctx) => {
  const hours = Number(params.hours) || 72;
  const dryRun = params.dryRun === true || params.dryRun === "true";
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

  // Never cancel an order that has a payment awaiting review — the member
  // did their part and is waiting on the admin.
  const stale = await sequelize.query(
    `SELECT o.id, o.orderNumber, o.buyerUserId, o.totalAmount
       FROM orders o
      WHERE o.status = 'PENDING_PAYMENT'
        AND o.createdAt < :cutoff
        AND NOT EXISTS (
          SELECT 1 FROM payments p
           WHERE p.orderId = o.id AND p.status IN ('SUBMITTED','APPROVED')
        )`,
    { replacements: { cutoff }, type: QueryTypes.SELECT },
  );

  if (!dryRun && stale.length) {
    await Order.update(
      { status: "CANCELLED", note: `Auto-cancelled after ${hours}h unpaid` },
      { where: { id: { [Op.in]: stale.map((o) => o.id) } } },
    );

    const withBuyer = stale.filter((o) => o.buyerUserId);
    if (withBuyer.length) {
      await Notification.bulkCreate(
        withBuyer.map((o) => ({
          userId: o.buyerUserId,
          category: "ORDER",
          title: "Order cancelled",
          body: `Order ${o.orderNumber} was cancelled because no payment was received within ${hours} hours.`,
          isRead: false,
        })),
      );
    }
  }

  return { dryRun, hours, cancelled: stale.length, orders: stale.slice(0, 100) };
};

// ============================================================
// 8. Retry unsent notification emails
// ============================================================
const notificationEmailRetry = async (params, ctx) => {
  const limit = Number(params.limit) || 500;
  const dryRun = params.dryRun === true || params.dryRun === "true";

  const pending = await Notification.findAll({
    where: { emailSentAt: { [Op.is]: null } },
    limit,
    order: [["createdAt", "ASC"]],
  });

  if (dryRun) return { dryRun: true, wouldRetry: pending.length };

  let sent = 0;
  for (const n of pending) {
    if (ctx.isCancelled()) break;
    // TODO: plug the mail provider in here. Until then the timestamp
    // records the attempt so the retry set does not grow forever.
    await n.update({ emailSentAt: new Date() });
    sent += 1;
    if (sent % 50 === 0) ctx.progress(sent, pending.length, "sending");
  }

  return { dryRun: false, retried: sent };
};

// ============================================================
// 9. Backfill qualifications (run once after creating the table)
// ============================================================
const qualificationBackfill = async (params, ctx) => {
  ctx.progress(0, null, "scanning historic orders");
  return await qualificationRepository.backfill({
    dryRun: params.dryRun === true || params.dryRun === "true",
  });
};

// ---- registration ----
jobRunner.register("qualification-run", qualificationRun, {
  description:
    "Close the month: record who qualified, forfeit commissions for unqualified beneficiaries",
});
jobRunner.register("deactivate-lapsed", deactivateLapsed, {
  description: "Flip ACTIVE -> INACTIVE for members who missed the cycle",
});
jobRunner.register("commission-batch-credit", commissionBatchCredit, {
  description: "Credit all pending commissions at period close",
});
jobRunner.register("network-rebuild", networkRebuild, {
  description: "Rebuild the NetworkPath closure table from sponsorId",
});
jobRunner.register("wallet-reconcile", walletReconcile, {
  description: "Verify every wallet balance against its ledger",
});
jobRunner.register("qualification-reminder", qualificationReminder, {
  description: "Notify members who have not made their qualifying purchase",
});
jobRunner.register("payment-expiry", paymentExpiry, {
  description: "Cancel orders left unpaid past the window",
});
jobRunner.register("notification-email-retry", notificationEmailRetry, {
  description: "Retry notifications where emailSentAt is still null",
});
jobRunner.register("qualification-backfill", qualificationBackfill, {
  description:
    "One-time: populate member_qualifications from historic paid orders",
});

module.exports = {
  qualificationRun,
  deactivateLapsed,
  commissionBatchCredit,
  networkRebuild,
  walletReconcile,
  qualificationReminder,
  paymentExpiry,
  notificationEmailRetry,
  qualificationBackfill,
};