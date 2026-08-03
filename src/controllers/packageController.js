const packageService = require("../services/packageService");

const packageController = {
  getAll: async (req, res) => {
    try {
      const packages = await packageService.getAll();
      res.json({ success: true, data: packages });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const pkg = await packageService.getById(req.params.id);
      res.json({ success: true, data: pkg });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const pkg = await packageService.create(req.body);
      res.status(201).json({ success: true, data: pkg });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const pkg = await packageService.update(req.params.id, req.body);
      res.json({ success: true, data: pkg });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await packageService.delete(req.params.id);
      res.json({ success: true, message: "Package deleted" });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
};

module.exports = packageController;