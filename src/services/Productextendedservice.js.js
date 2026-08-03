const productRelationshipRepository = require("../repositories/productRelationshipRepository");
const productBusinessRepository = require("../repositories/productBusinessRepository");
const productFilterRepository = require("../repositories/productFilterRepository");

const productExtendedService = {
  getPackagesContaining: async (productId) => {
    return await productRelationshipRepository.getPackagesContaining(productId);
  },

  getOrderItems: async (productId) => {
    return await productRelationshipRepository.getOrderItems(productId);
  },

  activate: async (productId) => {
    return await productBusinessRepository.setActive(productId, true);
  },

  deactivate: async (productId) => {
    return await productBusinessRepository.setActive(productId, false);
  },

  setImage: async (productId, imageUrl) => {
    return await productBusinessRepository.setImage(productId, imageUrl);
  },

  getCategories: async () => {
    return await productBusinessRepository.getCategories();
  },

  getSalesStats: async (productId, from, to) => {
    return await productBusinessRepository.getSalesStats(productId, from, to);
  },

  bulkImport: async (rows, dryRun) => {
    return await productBusinessRepository.bulkImport(rows, dryRun);
  },

  findFiltered: async (query) => {
    return await productFilterRepository.findFiltered(query);
  },
};

module.exports = productExtendedService;