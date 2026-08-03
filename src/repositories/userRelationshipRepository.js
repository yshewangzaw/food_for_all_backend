const {
  User,
  NetworkPath,
  KycDocument,
  Order,
  Payment,
  Commission,
  WalletTransaction,
  WithdrawalRequest,
  Notification,
} = require("../models");
const { Op } = require("sequelize");

const userRelationshipRepository = {
  getSponsor: async (userId) => {
    const user = await User.findByPk(userId);
    if (!user || !user.sponsorId) return null;
    return await User.findByPk(user.sponsorId);
  },

  getDirectReferrals: async (userId, { page = 1, limit = 25 } = {}) => {
    const offset = (page - 1) * limit;
    const { rows, count } = await User.findAndCountAll({
      where: { sponsorId: userId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
    return { rows, count };
  },

  // Descendants resolved through NetworkPath, capped at maxLevel
  getDownline: async (userId, maxLevel = 3) => {
    const paths = await NetworkPath.findAll({
      where: {
        ancestorId: userId,
        level: { [Op.gt]: 0, [Op.lte]: maxLevel },
      },
      order: [["level", "ASC"]],
    });

    const descendantIds = paths.map((p) => p.descendantId);
    if (descendantIds.length === 0) return [];

    const users = await User.findAll({
      where: { id: { [Op.in]: descendantIds } },
      attributes: ["id", "fullName", "email", "depth", "status"],
    });

    // attach the level from the path lookup
    const levelById = Object.fromEntries(paths.map((p) => [p.descendantId, p.level]));
    return users.map((u) => ({ ...u.toJSON(), level: levelById[u.id] }));
  },

  // Full ancestor chain up to the root
  getUpline: async (userId) => {
    const paths = await NetworkPath.findAll({
      where: {
        descendantId: userId,
        level: { [Op.gt]: 0 },
      },
      order: [["level", "ASC"]],
    });

    const ancestorIds = paths.map((p) => p.ancestorId);
    if (ancestorIds.length === 0) return [];

    const users = await User.findAll({
      where: { id: { [Op.in]: ancestorIds } },
      attributes: ["id", "fullName", "email", "depth"],
    });

    const levelById = Object.fromEntries(paths.map((p) => [p.ancestorId, p.level]));
    return users
      .map((u) => ({ ...u.toJSON(), level: levelById[u.id] }))
      .sort((a, b) => a.level - b.level);
  },

  getKycDocuments: async (userId) => {
    return await KycDocument.findAll({ where: { userId } });
  },

  getOrders: async (userId) => {
    return await Order.findAll({ where: { buyerUserId: userId } });
  },

  getPayments: async (userId) => {
    return await Payment.findAll({ where: { userId } });
  },

  getCommissionsEarned: async (userId) => {
    return await Commission.findAll({ where: { beneficiaryUserId: userId } });
  },

  getCommissionsGenerated: async (userId) => {
    return await Commission.findAll({ where: { sourceUserId: userId } });
  },

  getWalletTransactions: async (userId) => {
    return await WalletTransaction.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  },

  getWithdrawals: async (userId) => {
    return await WithdrawalRequest.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  },

  getNotifications: async (userId) => {
    return await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  },
};

module.exports = userRelationshipRepository;