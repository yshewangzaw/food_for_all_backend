const commissionExtendedService = require("../services/commissionExtendedService");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const commissionExtendedController = {
  getBeneficiary: async (req, res) => {
    try {
      ok(res, await commissionExtendedService.getBeneficiary(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },
  getSourceUser: async (req, res) => {
    try {
      ok(res, await commissionExtendedService.getSourceUser(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },
  getRule: async (req, res) => {
    try {
      ok(res, await commissionExtendedService.getRule(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },
  getOrder: async (req, res) => {
    try {
      ok(res, await commissionExtendedService.getOrder(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },
  getWalletTransaction: async (req, res) => {
    try {
      ok(
        res,
        await commissionExtendedService.getWalletTransaction(req.params.id),
      );
    } catch (error) {
      fail(res, 500, error);
    }
  },

  processOrder: async (req, res) => {
    try {
      const result = await commissionExtendedService.processOrder(
        req.params.id,
      );
      res.json({
        success: true,
        message: result.alreadyProcessed
          ? "Already processed — returning existing run"
          : "Commissions processed",
        data: result,
      });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  previewOrder: async (req, res) => {
    try {
      ok(res, await commissionExtendedService.previewOrder(req.params.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  reverseOrder: async (req, res) => {
    try {
      const result = await commissionExtendedService.reverseOrder(
        req.params.id,
        req.body.reason,
      );
      res.json({
        success: true,
        message: "Order commissions reversed",
        data: result,
      });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  creditCommission: async (req, res) => {
    try {
      ok(res, await commissionExtendedService.creditCommission(req.params.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  reverseSingle: async (req, res) => {
    try {
      ok(
        res,
        await commissionExtendedService.reverseSingle(
          req.params.id,
          req.body.reason,
        ),
      );
    } catch (error) {
      fail(res, 400, error);
    }
  },

  forfeit: async (req, res) => {
    try {
      ok(
        res,
        await commissionExtendedService.forfeit(
          req.params.id,
          req.body.forfeitReason,
        ),
      );
    } catch (error) {
      fail(res, 400, error);
    }
  },

  batchCredit: async (req, res) => {
    try {
      const result = await commissionExtendedService.batchCredit(
        req.body.commissionIds,
      );
      res.json({ success: true, jobId: `batch-${Date.now()}`, data: result });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  recalculate: async (req, res) => {
    try {
      const { periodStart, periodEnd } = req.body;
      const result = await commissionExtendedService.recalculate(
        new Date(periodStart),
        new Date(periodEnd),
      );
      res.json({
        success: true,
        message: "Recalculation complete",
        data: result,
      });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  getPendingSummary: async (req, res) => {
    try {
      ok(res, await commissionExtendedService.getPendingSummary());
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getMySummary: async (req, res) => {
    try {
      ok(
        res,
        await commissionExtendedService.getMySummary(
          req.user.id,
          req.query.period,
        ),
      );
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getMyBySource: async (req, res) => {
    try {
      ok(res, await commissionExtendedService.getMyBySource(req.user.id));
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getMyTimeline: async (req, res) => {
    try {
      ok(
        res,
        await commissionExtendedService.getMyTimeline(
          req.user.id,
          req.query.groupBy,
        ),
      );
    } catch (error) {
      fail(res, 500, error);
    }
  },

  simulate: async (req, res) => {
    try {
      const { buyerUserId, orderAmount, orderPv } = req.body;
      ok(
        res,
        await commissionExtendedService.simulate(
          buyerUserId,
          orderAmount,
          orderPv,
        ),
      );
    } catch (error) {
      fail(res, 400, error);
    }
  },

  findFiltered: async (req, res) => {
    try {
      const result = await commissionExtendedService.findFiltered(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      fail(res, 500, error);
    }
  },
};

module.exports = commissionExtendedController;
