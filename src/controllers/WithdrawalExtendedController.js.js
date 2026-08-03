const withdrawalExtendedService = require("../services/withdrawalExtendedService");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const withdrawalExtendedController = {
  // ---------- relationships ----------
  getUser: async (req, res) => {
    try {
      ok(res, await withdrawalExtendedService.getUser(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  getPaymentMethod: async (req, res) => {
    try {
      ok(res, await withdrawalExtendedService.getPaymentMethod(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  getWalletTransactions: async (req, res) => {
    try {
      ok(res, await withdrawalExtendedService.getWalletTransactions(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  // ---------- member ----------
  // GET /api/me/withdrawals/eligibility
  getEligibility: async (req, res) => {
    try {
      ok(res, await withdrawalExtendedService.getEligibility(req.user.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  // POST /api/withdrawals
  create: async (req, res) => {
    try {
      const request = await withdrawalExtendedService.create({
        userId: req.user.id, // never trust a userId from the body
        amount: req.body.amount,
        paymentMethodId: req.body.paymentMethodId,
        accountNumber: req.body.accountNumber,
      });
      res.status(201).json({ success: true, data: request });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  // POST /api/withdrawals/:id/cancel
  cancel: async (req, res) => {
    try {
      ok(res, await withdrawalExtendedService.cancel(req.params.id, req.user.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  // ---------- admin ----------
  review: async (req, res) => {
    try {
      ok(res, await withdrawalExtendedService.review(req.params.id, req.user.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  approve: async (req, res) => {
    try {
      ok(res, await withdrawalExtendedService.approve(req.params.id, req.user.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  reject: async (req, res) => {
    try {
      ok(
        res,
        await withdrawalExtendedService.reject(
          req.params.id,
          req.user.id,
          req.body.rejectionReason || req.body.reason,
        ),
      );
    } catch (error) {
      fail(res, 400, error);
    }
  },

  markPaid: async (req, res) => {
    try {
      const data = {
        paymentReference: req.body.paymentReference,
        proofImageUrl: req.file
          ? `/uploads/${req.file.filename}`
          : req.body.proofImageUrl,
      };
      ok(
        res,
        await withdrawalExtendedService.markPaid(req.params.id, req.user.id, data),
      );
    } catch (error) {
      fail(res, 400, error);
    }
  },

  bulkMarkPaid: async (req, res) => {
    try {
      const items = req.body.items;
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("items must be a non-empty array");
      }
      ok(res, await withdrawalExtendedService.bulkMarkPaid(items, req.user.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  getQueue: async (req, res) => {
    try {
      ok(res, await withdrawalExtendedService.getQueue(req.query.status));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  getPayoutBatch: async (req, res) => {
    try {
      ok(res, await withdrawalExtendedService.getPayoutBatch(req.query.date));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  findFiltered: async (req, res) => {
    try {
      const result = await withdrawalExtendedService.findFiltered(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      fail(res, 400, error);
    }
  },
};

module.exports = withdrawalExtendedController;