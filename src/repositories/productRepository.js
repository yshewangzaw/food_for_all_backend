const { Product } = require("../models");

const productRepository = {
  findAll: async () => {
    return await Product.findAll();
  },

  findById: async (id) => {
    return await Product.findByPk(id);
  },

  create: async (data) => {
    return await Product.create(data);
  },

  update: async (id, data) => {
    const product = await Product.findByPk(id);
    if (!product) return null;
    await product.update(data);
    return await Product.findByPk(id);
  },

  delete: async (id) => {
    const product = await Product.findByPk(id);
    if (!product) return null;
    await product.destroy();
    return product;
  }
};

module.exports = productRepository;