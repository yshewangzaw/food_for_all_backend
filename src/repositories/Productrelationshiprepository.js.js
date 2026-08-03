const { Product, Package, PackageItem, OrderItem } = require("../models");

const productRelationshipRepository = {
  getPackagesContaining: async (productId) => {
    const items = await PackageItem.findAll({
      where: { productId },
      include: [{ model: Package, as: "package" }],
    });
    return items.map((i) => i.package).filter(Boolean);
  },

  getOrderItems: async (productId) => {
    return await OrderItem.findAll({ where: { productId } });
  },
};

module.exports = productRelationshipRepository;