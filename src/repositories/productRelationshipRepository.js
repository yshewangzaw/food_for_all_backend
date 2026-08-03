const { Product } = require("../models");

const productRelationshipRepository = {
  getPackagesContaining: async (productId) => {
    return [];
  },

  getOrderItems: async (productId) => {
    return [];
  },
};

module.exports = productRelationshipRepository;
