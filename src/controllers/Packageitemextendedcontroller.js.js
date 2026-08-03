const packageItemExtendedService = require("../services/packageItemExtendedService");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const packageItemExtendedController = {
  addItem: async (req, res) => {
    try {
      const item = await packageItemExtendedService.addItem(req.params.id, req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  updateItemQuantity: async (req, res) => {
    try {
      const item = await packageItemExtendedService.updateItemQuantity(
        req.params.id,
        req.params.itemId,
        req.body.quantity
      );
      ok(res, item);
    } catch (error) {
      fail(res, 404, error);
    }
  },

  removeItem: async (req, res) => {
    try {
      await packageItemExtendedService.removeItem(req.params.id, req.params.itemId);
      res.json({ success: true, message: "Item removed" });
    } catch (error) {
      fail(res, 404, error);
    }
  },

  replaceAllItems: async (req, res) => {
    try {
      const items = await packageItemExtendedService.replaceAllItems(
        req.params.id,
        req.body.items
      );
      res.json({ success: true, message: "Package contents replaced", data: items });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  getProductForItem: async (req, res) => {
    try {
      ok(res, await packageItemExtendedService.getProductForItem(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  getPackageForItem: async (req, res) => {
    try {
      ok(res, await packageItemExtendedService.getPackageForItem(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },
};

module.exports = packageItemExtendedController;