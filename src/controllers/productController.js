const productExtendedService = require("../services/productExtendedService");
const productService = require("../services/productService");

const productController = {
  getAll: async (req, res) => {
    try {
      const result = await productExtendedService.findFiltered(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getCategories: async (req, res) => {
    try {
      const categories = await productService.getCategories();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  getOne: async (req, res) => {
    try {
      const product = await productService.getById(req.params.id);
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const product = await productService.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const product = await productService.update(req.params.id, req.body);
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await productService.delete(req.params.id);
      res.json({ success: true, message: "Product deleted" });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },
};

module.exports = productController;
