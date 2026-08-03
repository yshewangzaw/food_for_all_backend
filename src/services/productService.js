const Product = require("../models/Product");
const productRepository = require("../repositories/productRepository");

const productService = {
  getAll: async () => {
    return await productRepository.findAll();
  },

  getById: async (id) => {
    const product = await productRepository.findById(id);
    if (!product) throw new Error("Product not found");
    return product;
  },

  create: async (data) => {
    return await productRepository.create(data);
  },

  update: async (id, data) => {
    const product = await productRepository.update(id, data);
    if (!product) throw new Error("Product not found");
    return product;
  },

  delete: async (id) => {
    const product = await productRepository.delete(id);
    if (!product) throw new Error("Product not found");
    return product;
  },
  getCategories: async () => {
    const products = await Product.findAll({
      attributes: ["category"],
      group: ["category"],
    });

    return products.map((product) => product.category);
  },
};

module.exports = productService;
