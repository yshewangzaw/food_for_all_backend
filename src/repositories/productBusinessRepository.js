const { Product } = require("../models");

const productBusinessRepository = {
  setActive: async (productId, active) => {
    const product = await Product.findByPk(productId);
    if (!product) throw new Error("Product not found");
    await product.update({ isActive: active });
    return product;
  },

  setImage: async (productId, imageUrl) => {
    const product = await Product.findByPk(productId);
    if (!product) throw new Error("Product not found");
    await product.update({ imageUrl });
    return product;
  },

  getCategories: async () => {
    return [];
  },

  getSalesStats: async (productId, from, to) => {
    return { productId, from, to, totalSales: 0 };
  },

  bulkImport: async (rows, dryRun) => {
    return { created: 0, dryRun, rows: rows.length };
  },
};

module.exports = productBusinessRepository;
