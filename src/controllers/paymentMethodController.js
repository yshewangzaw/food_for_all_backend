const service = require("../services/paymentMethodService");

const controller = {
  getAll: async (req, res) => {
    try {
      res.json({ success: true, data: await service.getAll() });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  },
  getOne: async (req, res) => {
    try {
      res.json({ success: true, data: await service.getById(req.params.id) });
    } catch (e) {
      res.status(404).json({ success: false, message: e.message });
    }
  },
  create: async (req, res) => {
    try {
      res.status(201).json({ success: true, data: await service.create(req.body) });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  },
  update: async (req, res) => {
    try {
      res.json({ success: true, data: await service.update(req.params.id, req.body) });
    } catch (e) {
      res.status(404).json({ success: false, message: e.message });
    }
  },
  delete: async (req, res) => {
    try {
      await service.delete(req.params.id);
      res.json({ success: true, message: "Payment method deleted" });
    } catch (e) {
      res.status(404).json({ success: false, message: e.message });
    }
  },
};

module.exports = controller;