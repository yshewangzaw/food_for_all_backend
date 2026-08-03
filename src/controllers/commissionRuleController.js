const commissionRuleExtendedService = require("../services/commissionRuleExtendedService");

const commissionRuleService = require("../services/commissionRuleService");

const commissionRuleController = {
  getAll: async (req, res) => {
    try {
      const rules = await commissionRuleExtendedService.findFiltered(req.query);
      res.json({ success: true, data: rules });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const data = await commissionRuleService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const data = await commissionRuleService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const data = await commissionRuleService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await commissionRuleService.delete(req.params.id);
      res.json({ success: true, message: "Commission rule deleted" });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },
};

module.exports = commissionRuleController;
