const walletTransactionService = require("../services/walletTransactionService");

const walletTransactionController = {
  getAll: async (req, res) => {
    try {
      const data = await walletTransactionService.getAll();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getByUserId: async (req, res) => {
    try {
      const data = await walletTransactionService.getByUserId(req.params.userId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const data = await walletTransactionService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const data = await walletTransactionService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = walletTransactionController;