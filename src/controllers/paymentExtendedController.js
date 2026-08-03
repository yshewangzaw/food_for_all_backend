const paymentExtendedService = require("../services/paymentExtendedService");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const paymentExtendedController = {
  getOrder: async (req, res) => {
    try {
      ok(res, await paymentExtendedService.getOrder(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },
  getMethod: async (req, res) => {
    try {
      ok(res, await paymentExtendedService.getMethod(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },
  getUser: async (req, res) => {
    try {
      ok(res, await paymentExtendedService.getUser(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },
  getReviewer: async (req, res) => {
    try {
      ok(res, await paymentExtendedService.getReviewer(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  create: async (req, res) => {
    try {
      const data = { ...req.body };
      if (req.file) data.proofImageUrl = `/uploads/${req.file.filename}`;
      if (req.user) data.userId = req.user.id;
      const payment = await paymentExtendedService.create(data);
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  approve: async (req, res) => {
    try {
      const result = await paymentExtendedService.approve(
        req.params.id,
        req.user.id,
      );
      res.json({ success: true, message: "Payment approved", data: result });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  reject: async (req, res) => {
    try {
      const payment = await paymentExtendedService.reject(
        req.params.id,
        req.user.id,
        req.body.rejectionReason,
      );
      ok(res, payment);
    } catch (error) {
      fail(res, 400, error);
    }
  },

  cancel: async (req, res) => {
    try {
      ok(res, await paymentExtendedService.cancel(req.params.id, req.user.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  resubmitProof: async (req, res) => {
    try {
      if (!req.file) throw new Error("No proof image provided");
      const proofImageUrl = `/uploads/${req.file.filename}`;
      ok(
        res,
        await paymentExtendedService.resubmitProof(
          req.params.id,
          proofImageUrl,
        ),
      );
    } catch (error) {
      fail(res, 400, error);
    }
  },

  getQueue: async (req, res) => {
    try {
      ok(res, await paymentExtendedService.getQueue());
    } catch (error) {
      fail(res, 500, error);
    }
  },

  checkReference: async (req, res) => {
    try {
      ok(
        res,
        await paymentExtendedService.checkReference(req.query.referenceNo),
      );
    } catch (error) {
      fail(res, 500, error);
    }
  },

  bulkApprove: async (req, res) => {
    try {
      const result = await paymentExtendedService.bulkApprove(
        req.body.paymentIds,
        req.user.id,
      );
      res.json({ success: true, data: result });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  findFiltered: async (req, res) => {
    try {
      const result = await paymentExtendedService.findFiltered(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      fail(res, 500, error);
    }
  },
};

module.exports = paymentExtendedController;
