const paymentMethodExtendedService = require("../services/paymentMethodExtendedService");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const paymentMethodExtendedController = {
  getPayments: async (req, res) => {
    try {
      ok(res, await paymentMethodExtendedService.getPayments(req.params.id));
    } catch (error) {
      fail(res, 500, error);
    }
  },
  getActive: async (req, res) => {
    try {
      ok(res, await paymentMethodExtendedService.getActive());
    } catch (error) {
      fail(res, 500, error);
    }
  },
  getAvailableForAmount: async (req, res) => {
    try {
      ok(
        res,
        await paymentMethodExtendedService.getAvailableForAmount(
          req.query.amount,
        ),
      );
    } catch (error) {
      fail(res, 500, error);
    }
  },
  activate: async (req, res) => {
    try {
      ok(res, await paymentMethodExtendedService.activate(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },
  deactivate: async (req, res) => {
    try {
      ok(res, await paymentMethodExtendedService.deactivate(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },
};

module.exports = paymentMethodExtendedController;
