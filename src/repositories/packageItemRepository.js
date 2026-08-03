const { PackageItem, Product, Package } = require("../models");

const packageItemRepository = {
  findAll: async () => {
    return await PackageItem.findAll({
      include: [
        { model: Product, as: "product" },
        { model: Package, as: "package" },
      ],
    });
  },

  findById: async (id) => {
    return await PackageItem.findByPk(id, {
      include: [
        { model: Product, as: "product" },
        { model: Package, as: "package" },
      ],
    });
  },

  create: async (data) => {
    return await PackageItem.create(data);
  },

  update: async (id, data) => {
    const item = await PackageItem.findByPk(id);
    if (!item) return null;
    await item.update(data);
    return await PackageItem.findByPk(id, {
      include: [
        { model: Product, as: "product" },
        { model: Package, as: "package" },
      ],
    });
  },

  delete: async (id) => {
    const item = await PackageItem.findByPk(id);
    if (!item) return null;
    await item.destroy();
    return item;
  },
};

module.exports = packageItemRepository;