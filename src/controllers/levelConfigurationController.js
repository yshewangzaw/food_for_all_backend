const levelConfigurationService = require("../services/levelConfigurationService");

const levelConfigurationController = {
  getAll: async (req, res) => {
    try {
      const data = await levelConfigurationService.getAll();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const data = await levelConfigurationService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const data = await levelConfigurationService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const data = await levelConfigurationService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await levelConfigurationService.delete(req.params.id);
      res.json({ success: true, message: "Level configuration deleted" });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },
};

module.exports = levelConfigurationController;