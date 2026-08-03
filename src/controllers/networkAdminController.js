const networkAdminService = require("../services/networkAdminService");

const networkAdminController = {
  rebuildAll: async (req, res) => {
    try {
      const result = await networkAdminService.rebuildAll();
      res.json({ success: true, message: "Network rebuilt successfully", data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  rebuildSubtree: async (req, res) => {
    try {
      const result = await networkAdminService.rebuildSubtree(req.params.userId);
      res.json({ success: true, message: "Subtree rebuilt successfully", data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  integrityCheck: async (req, res) => {
    try {
      const result = await networkAdminService.integrityCheck();
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = networkAdminController;