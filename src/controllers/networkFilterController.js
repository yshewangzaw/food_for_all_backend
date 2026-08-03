const networkFilterService = require("../services/networkFilterService");

const networkFilterController = {
  findNetworkPaths: async (req, res) => {
    try {
      const result = await networkFilterService.findNetworkPaths(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  findDescendantsFiltered: async (req, res) => {
    try {
      const result = await networkFilterService.findDescendantsFiltered(
        req.params.userId,
        req.query
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = networkFilterController;