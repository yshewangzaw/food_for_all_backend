const orderService = require("../services/orderService");

const orderController = {
  getAll: async (req, res) => {
    try {
      const orders = await orderService.getAll();
      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const order = await orderService.getById(req.params.id);
      res.json({ success: true, data: order });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const order = await orderService.create(req.body);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const order = await orderService.update(req.params.id, req.body);
      res.json({ success: true, data: order });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await orderService.delete(req.params.id);
      res.json({ success: true, message: "Order deleted" });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },
};

module.exports = orderController;