const {
  WalletTransaction,
  User,
  Commission,
  WithdrawalRequest,
} = require("../models");
const sequelize = require("../config/database");
const { Op, QueryTypes } = require("sequelize");
const { getPagination, buildMeta } = require("../utils/pagination");

/**
 * Shared ledger writer. EVERY balance change in the system must go through
 * this function — it is the only place that touches `wallet` / `lockedBalance`
 * and writes the matching row in one step.
 *
 * Always call it inside a transaction, and always with a row lock on the user,
 * or two concurrent commissions will both read the same balanceBefore and one
 * of them will be silently lost.
 */
const postTransaction = async (
  {
    userId,
    transactionType,
    direction,
    amount,
    referenceType = null,
    referenceId = null,
    description = null,
    createdById = null,
    affects = "available", // "available" | "locked" | "lock" | "unlock"
  },
  t,
) => {
  const user = await User.findByPk(userId, {
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  if (!user) throw new Error("User not found");

  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) throw new Error("Amount must be greater than 0");

  const available = parseFloat(user.wallet);
  const locked = parseFloat(user.lockedBalance || 0);

  let newAvailable = available;
  let newLocked = locked;

  if (affects === "lock") {
    // available -> locked. Total unchanged.
    if (available < amt) {
      throw new Error(
        `Insufficient balance. Available ${available.toFixed(2)}, requested ${amt.toFixed(2)}`,
      );
    }
    newAvailable = available - amt;
    newLocked = locked + amt;
  } else if (affects === "unlock") {
    // locked -> available. Total unchanged.
    if (locked < amt) throw new Error("Locked balance is lower than the amount");
    newLocked = locked - amt;
    newAvailable = available + amt;
  } else if (affects === "locked") {
    // money leaves the locked bucket for good (the actual payout)
    if (locked < amt) throw new Error("Locked balance is lower than the amount");
    newLocked = locked - amt;
  } else {
    // plain credit or debit against available
    newAvailable =
      direction === "CREDIT" ? available + amt : available - amt;
    if (newAvailable < 0) throw new Error("Insufficient available balance");
  }

  const row = await WalletTransaction.create(
    {
      userId,
      transactionType,
      direction,
      amount: amt,
      balanceBefore: available,
      balanceAfter: newAvailable,
      referenceType,
      referenceId,
      description,
      createdById,
    },
    { transaction: t },
  );

  await user.update(
    { wallet: newAvailable, lockedBalance: newLocked },
    { transaction: t },
  );

  return row;
};

const walletExtendedRepository = {
  postTransaction,

  // ---------- balances ----------
  getBalance: async (userId) => {
    const user = await User.findByPk(userId, {
      attributes: ["id", "fullName", "wallet", "lockedBalance", "kycStatus"],
    });
    if (!user) throw new Error("User not found");

    const [totals] = await sequelize.query(
      `SELECT
         COALESCE(SUM(CASE WHEN direction = 'CREDIT'
                            AND transactionType = 'COMMISSION_CREDIT'
                      THEN amount ELSE 0 END), 0) AS lifetimeEarned,
         COALESCE(SUM(CASE WHEN transactionType = 'WITHDRAWAL_DEBIT'
                      THEN amount ELSE 0 END), 0) AS lifetimeWithdrawn
       FROM wallet_transactions WHERE userId = :userId`,
      { replacements: { userId }, type: QueryTypes.SELECT },
    );

    const pendingCommission = await Commission.sum("commissionAmount", {
      where: { beneficiaryUserId: userId, status: "PENDING" },
    });

    const available = parseFloat(user.wallet);
    const locked = parseFloat(user.lockedBalance || 0);

    return {
      userId: user.id,
      fullName: user.fullName,
      availableBalance: available,
      lockedBalance: locked,
      totalBalance: available + locked,
      lifetimeEarned: parseFloat(totals.lifetimeEarned),
      lifetimeWithdrawn: parseFloat(totals.lifetimeWithdrawn),
      pendingCommission: parseFloat(pendingCommission || 0),
      kycStatus: user.kycStatus,
    };
  },

  // ---------- ledger ----------
  getTransactions: async (userId, q = {}) => {
    const { page, limit, offset } = getPagination(q);
    const where = { userId };

    if (q.transactionType) where.transactionType = q.transactionType;
    if (q.direction) where.direction = q.direction;
    if (q.referenceType) where.referenceType = q.referenceType;
    if (q.referenceId) where.referenceId = q.referenceId;

    if (q.dateFrom || q.dateTo) {
      where.createdAt = {};
      if (q.dateFrom) where.createdAt[Op.gte] = new Date(q.dateFrom);
      if (q.dateTo) where.createdAt[Op.lte] = new Date(q.dateTo);
    }
    if (q.minAmount || q.maxAmount) {
      where.amount = {};
      if (q.minAmount) where.amount[Op.gte] = q.minAmount;
      if (q.maxAmount) where.amount[Op.lte] = q.maxAmount;
    }

    const { rows, count } = await WalletTransaction.findAndCountAll({
      where,
      order: [["createdAt", "DESC"], ["id", "DESC"]],
      limit,
      offset,
    });

    return { data: rows, meta: buildMeta({ count, page, limit }) };
  },

  // Resolve the polymorphic referenceType + referenceId to the real record
  getReference: async (transactionId) => {
    const tx = await WalletTransaction.findByPk(transactionId);
    if (!tx) throw new Error("Transaction not found");
    if (!tx.referenceType || !tx.referenceId) {
      return { referenceType: null, record: null };
    }

    let record = null;
    if (tx.referenceType === "COMMISSION") {
      record = await Commission.findByPk(tx.referenceId);
    } else if (tx.referenceType === "WITHDRAWAL") {
      record = await WithdrawalRequest.findByPk(tx.referenceId);
    }

    return { referenceType: tx.referenceType, referenceId: tx.referenceId, record };
  },

  getCreatedBy: async (transactionId) => {
    const tx = await WalletTransaction.findByPk(transactionId);
    if (!tx) throw new Error("Transaction not found");
    if (!tx.createdById) return null;
    return await User.findByPk(tx.createdById, {
      attributes: ["id", "fullName", "email", "role"],
    });
  },

  // ---------- statement ----------
  getStatement: async (userId, { from, to } = {}) => {
    const where = { userId };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const rows = await WalletTransaction.findAll({
      where,
      order: [["createdAt", "ASC"], ["id", "ASC"]],
      raw: true,
    });

    const credits = rows
      .filter((r) => r.direction === "CREDIT")
      .reduce((s, r) => s + parseFloat(r.amount), 0);
    const debits = rows
      .filter((r) => r.direction === "DEBIT")
      .reduce((s, r) => s + parseFloat(r.amount), 0);

    return {
      period: { from: from || null, to: to || null },
      openingBalance: rows.length ? parseFloat(rows[0].balanceBefore) : 0,
      closingBalance: rows.length
        ? parseFloat(rows[rows.length - 1].balanceAfter)
        : 0,
      totalCredits: credits,
      totalDebits: debits,
      transactionCount: rows.length,
      transactions: rows,
    };
  },

  // ---------- manual adjustment ----------
  adjust: async ({ userId, amount, direction, description }, adminId) => {
    if (!description || !description.trim()) {
      throw new Error("A description is required for manual adjustments");
    }
    if (!["CREDIT", "DEBIT"].includes(direction)) {
      throw new Error("direction must be CREDIT or DEBIT");
    }

    const t = await sequelize.transaction();
    try {
      const row = await postTransaction(
        {
          userId,
          transactionType:
            direction === "CREDIT" ? "ADJUSTMENT_CREDIT" : "ADJUSTMENT_DEBIT",
          direction,
          amount,
          referenceType: "MANUAL",
          // MANUAL rows have no natural foreign id, but the unique index on
          // (referenceType, referenceId, transactionType) would collide on a
          // second adjustment of the same kind if we left this null in MySQL
          // — NULLs don't collide, so null is exactly what we want here.
          referenceId: null,
          description: description.trim(),
          createdById: adminId,
          affects: "available",
        },
        t,
      );
      await t.commit();
      return row;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  // Post a REVERSAL against a specific prior transaction
  reverse: async ({ transactionId, description }, adminId) => {
    const t = await sequelize.transaction();
    try {
      const original = await WalletTransaction.findByPk(transactionId, {
        transaction: t,
      });
      if (!original) throw new Error("Transaction not found");
      if (original.transactionType === "REVERSAL") {
        throw new Error("Cannot reverse a reversal");
      }

      const already = await WalletTransaction.findOne({
        where: {
          transactionType: "REVERSAL",
          referenceType: original.referenceType,
          referenceId: original.referenceId,
        },
        transaction: t,
      });
      if (already) throw new Error("This transaction was already reversed");

      const row = await postTransaction(
        {
          userId: original.userId,
          transactionType: "REVERSAL",
          direction: original.direction === "CREDIT" ? "DEBIT" : "CREDIT",
          amount: original.amount,
          referenceType: original.referenceType,
          referenceId: original.referenceId,
          description:
            description || `Reversal of transaction #${original.id}`,
          createdById: adminId,
          affects: "available",
        },
        t,
      );

      await t.commit();
      return row;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  // ---------- admin oversight ----------
  // Compare each user's stored balance against the sum of their ledger rows.
  reconcile: async () => {
    const drift = await sequelize.query(
      `SELECT u.id AS userId, u.fullName,
              u.wallet AS storedBalance,
              COALESCE(SUM(CASE WHEN wt.direction = 'CREDIT'
                                THEN wt.amount ELSE -wt.amount END), 0) AS ledgerBalance
         FROM users u
         LEFT JOIN wallet_transactions wt ON wt.userId = u.id
        GROUP BY u.id, u.fullName, u.wallet
       HAVING ABS(u.wallet - ledgerBalance) > 0.01`,
      { type: QueryTypes.SELECT },
    );

    const lockDrift = await sequelize.query(
      `SELECT u.id AS userId, u.fullName,
              u.lockedBalance AS storedLocked,
              COALESCE(w.pending, 0) AS actualLocked
         FROM users u
         LEFT JOIN (
           SELECT userId, SUM(amount) AS pending
             FROM withdrawal_requests
            WHERE status IN ('PENDING','UNDER_REVIEW','APPROVED')
            GROUP BY userId
         ) w ON w.userId = u.id
        WHERE ABS(u.lockedBalance - COALESCE(w.pending, 0)) > 0.01`,
      { type: QueryTypes.SELECT },
    );

    return {
      healthy: drift.length === 0 && lockDrift.length === 0,
      balanceDrift: drift,
      lockDrift,
      checkedAt: new Date(),
    };
  },

  getLiability: async () => {
    const [totals] = await sequelize.query(
      `SELECT COALESCE(SUM(wallet), 0)        AS totalAvailable,
              COALESCE(SUM(lockedBalance), 0) AS totalLocked,
              COUNT(CASE WHEN wallet > 0 THEN 1 END) AS usersWithBalance
         FROM users`,
      { type: QueryTypes.SELECT },
    );

    const pendingCommission = await Commission.sum("commissionAmount", {
      where: { status: "PENDING" },
    });

    const available = parseFloat(totals.totalAvailable);
    const locked = parseFloat(totals.totalLocked);

    return {
      totalAvailable: available,
      totalLocked: locked,
      totalLiability: available + locked,
      pendingCommission: parseFloat(pendingCommission || 0),
      usersWithBalance: Number(totals.usersWithBalance),
    };
  },

  // ---------- filter (spec 6.1) ----------
  findFiltered: async (q) => {
    const { page, limit, offset } = getPagination(q);
    const where = {};

    if (q.userId) where.userId = q.userId;
    if (q.transactionType) where.transactionType = q.transactionType;
    if (q.direction) where.direction = q.direction;
    if (q.referenceType) where.referenceType = q.referenceType;
    if (q.referenceId) where.referenceId = q.referenceId;
    if (q.createdById) where.createdById = q.createdById;

    if (q.dateFrom || q.dateTo) {
      where.createdAt = {};
      if (q.dateFrom) where.createdAt[Op.gte] = new Date(q.dateFrom);
      if (q.dateTo) where.createdAt[Op.lte] = new Date(q.dateTo);
    }
    if (q.minAmount || q.maxAmount) {
      where.amount = {};
      if (q.minAmount) where.amount[Op.gte] = q.minAmount;
      if (q.maxAmount) where.amount[Op.lte] = q.maxAmount;
    }

    const sort = ["createdAt", "amount"].includes(q.sort) ? q.sort : "createdAt";
    const order = String(q.order).toLowerCase() === "asc" ? "ASC" : "DESC";

    const { rows, count } = await WalletTransaction.findAndCountAll({
      where,
      include: [{ model: User, attributes: ["id", "fullName", "phone"] }],
      order: [[sort, order]],
      limit,
      offset,
      distinct: true,
    });

    return { data: rows, meta: buildMeta({ count, page, limit }) };
  },
};

module.exports = walletExtendedRepository;