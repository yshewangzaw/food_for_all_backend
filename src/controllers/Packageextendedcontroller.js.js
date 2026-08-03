const packageExtendedService = require("../services/packageExtendedService");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const packageExtendedController = {
  getItems: async (req, res) => {
    try {
      ok(res, await packageExtendedService.getItems(req.params.id));
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getOrders: async (req, res) => {
    try {
      ok(res, await packageExtendedService.getOrders(req.params.id));
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getEntryPackage: async (req, res) => {
    try {
      const pkg = await packageExtendedService.getEntryPackage();

      return res.json({
        success: true,
        data: pkg,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  },

  getQualifyingPackages: async (req, res) => {
    try {
      ok(res, await packageExtendedService.getQualifyingPackages());
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getActiveOn: async (req, res) => {
    try {
      ok(res, await packageExtendedService.getActiveOn(req.query.on));
    } catch (error) {
      fail(res, 500, error);
    }
  },

  supersede: async (req, res) => {
    try {
      const result = await packageExtendedService.supersede(
        req.params.id,
        req.body,
      );
      res.json({ success: true, message: "Package superseded", data: result });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  activate: async (req, res) => {
    try {
      ok(res, await packageExtendedService.activate(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  deactivate: async (req, res) => {
    try {
      ok(res, await packageExtendedService.deactivate(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  uploadImage: async (req, res) => {
    try {
      if (!req.file) throw new Error("No image file provided");
      const imageUrl = `/uploads/${req.file.filename}`;
      ok(res, await packageExtendedService.setImage(req.params.id, imageUrl));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  getComputedValue: async (req, res) => {
    try {
      ok(res, await packageExtendedService.getComputedValue(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  getSalesStats: async (req, res) => {
    try {
      ok(
        res,
        await packageExtendedService.getSalesStats(
          req.params.id,
          req.query.from,
          req.query.to,
        ),
      );
    } catch (error) {
      fail(res, 500, error);
    }
  },
};

module.exports = packageExtendedController;
