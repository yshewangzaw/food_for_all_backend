const userRelationshipService = require("../services/userRelationshipService");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const userRelationshipController = {
  getSponsor: async (req, res) => {
    try {
      const sponsor = await userRelationshipService.getSponsor(req.params.id);
      ok(res, sponsor);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getDirectReferrals: async (req, res) => {
    try {
      const result = await userRelationshipService.getDirectReferrals(req.params.id, req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getDownline: async (req, res) => {
    try {
      const maxLevel = parseInt(req.query.maxLevel) || 3;
      const downline = await userRelationshipService.getDownline(req.params.id, maxLevel);
      ok(res, downline);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getUpline: async (req, res) => {
    try {
      const upline = await userRelationshipService.getUpline(req.params.id);
      ok(res, upline);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getKycDocuments: async (req, res) => {
    try {
      const docs = await userRelationshipService.getKycDocuments(req.params.id);
      ok(res, docs);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getOrders: async (req, res) => {
    try {
      const orders = await userRelationshipService.getOrders(req.params.id);
      ok(res, orders);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getPayments: async (req, res) => {
    try {
      const payments = await userRelationshipService.getPayments(req.params.id);
      ok(res, payments);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getCommissionsEarned: async (req, res) => {
    try {
      const commissions = await userRelationshipService.getCommissionsEarned(req.params.id);
      ok(res, commissions);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getCommissionsGenerated: async (req, res) => {
    try {
      const commissions = await userRelationshipService.getCommissionsGenerated(req.params.id);
      ok(res, commissions);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getWalletTransactions: async (req, res) => {
    try {
      const txns = await userRelationshipService.getWalletTransactions(req.params.id);
      ok(res, txns);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getWithdrawals: async (req, res) => {
    try {
      const withdrawals = await userRelationshipService.getWithdrawals(req.params.id);
      ok(res, withdrawals);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getNotifications: async (req, res) => {
    try {
      const notifications = await userRelationshipService.getNotifications(req.params.id);
      ok(res, notifications);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getKycDocumentOwner: async (req, res) => {
    try {
      const owner = await userRelationshipService.getKycDocumentOwner(req.params.id);
      ok(res, owner);
    } catch (error) {
      fail(res, 404, error);
    }
  },

  getKycDocumentReviewer: async (req, res) => {
    try {
      const reviewer = await userRelationshipService.getKycDocumentReviewer(req.params.id);
      ok(res, reviewer);
    } catch (error) {
      fail(res, 404, error);
    }
  },
};

module.exports = userRelationshipController;