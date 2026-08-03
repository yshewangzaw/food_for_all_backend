const userRelationshipRepository = require("../repositories/userRelationshipRepository");
const { KycDocument, User } = require("../models");

const userRelationshipService = {
  getSponsor: async (userId) => {
    return await userRelationshipRepository.getSponsor(userId);
  },

  getDirectReferrals: async (userId, query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 25;
    const { rows, count } = await userRelationshipRepository.getDirectReferrals(userId, {
      page,
      limit,
    });
    return {
      data: rows,
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  },

  getDownline: async (userId, maxLevel) => {
    return await userRelationshipRepository.getDownline(userId, maxLevel);
  },

  getUpline: async (userId) => {
    return await userRelationshipRepository.getUpline(userId);
  },

  getKycDocuments: async (userId) => {
    return await userRelationshipRepository.getKycDocuments(userId);
  },

  getOrders: async (userId) => {
    return await userRelationshipRepository.getOrders(userId);
  },

  getPayments: async (userId) => {
    return await userRelationshipRepository.getPayments(userId);
  },

  getCommissionsEarned: async (userId) => {
    return await userRelationshipRepository.getCommissionsEarned(userId);
  },

  getCommissionsGenerated: async (userId) => {
    return await userRelationshipRepository.getCommissionsGenerated(userId);
  },

  getWalletTransactions: async (userId) => {
    return await userRelationshipRepository.getWalletTransactions(userId);
  },

  getWithdrawals: async (userId) => {
    return await userRelationshipRepository.getWithdrawals(userId);
  },

  getNotifications: async (userId) => {
    return await userRelationshipRepository.getNotifications(userId);
  },

  // Last two routes in the spec are on KycDocument, not User —
  // kept here for now since they're simple; split out later if this file grows.
  getKycDocumentOwner: async (kycId) => {
    const doc = await KycDocument.findByPk(kycId);
    if (!doc) throw new Error("KYC document not found");
    const owner = await User.findByPk(doc.userId);
    return owner;
  },

  getKycDocumentReviewer: async (kycId) => {
    const doc = await KycDocument.findByPk(kycId);
    if (!doc) throw new Error("KYC document not found");
    if (!doc.reviewedById) return null; // schema gap #9 — field doesn't exist yet
    const reviewer = await User.findByPk(doc.reviewedById);
    return reviewer;
  },
};

module.exports = userRelationshipService;