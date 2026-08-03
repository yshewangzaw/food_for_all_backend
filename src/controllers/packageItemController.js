const packageItemService = require("../services/packageItemService");

const packageItemController = {
  getAll: async (req, res) => {
    try {
      const items = await packageItemService.getAll();
      res.json({ success: true, data: items });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const item = await packageItemService.getById(req.params.id);
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const item = await packageItemService.create(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const item = await packageItemService.update(req.params.id, req.body);
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await packageItemService.delete(req.params.id);
      res.json({ success: true, message: "Package item deleted" });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },
};

module.exports = packageItemController;