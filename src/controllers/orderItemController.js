const orderItemService = require("../services/orderItemService");

const orderItemController = {
  getAll: async (req, res) => {
    try {
      const data = await orderItemService.getAll();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getByOrderId: async (req, res) => {
    try {
      const data = await orderItemService.getByOrderId(req.params.orderId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const data = await orderItemService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const data = await orderItemService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const data = await orderItemService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await orderItemService.delete(req.params.id);
      res.json({ success: true, message: "Order item deleted" });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },
};

module.exports = orderItemController;