const { PackageItem, Package, Product } = require("../models");
const sequelize = require("../config/database");

const packageItemExtendedRepository = {
  addItem: async (packageId, { productId, quantity }) => {
    const pkg = await Package.findByPk(packageId);
    if (!pkg) throw new Error("Package not found");

    const product = await Product.findByPk(productId);
    if (!product) throw new Error("Product not found");

    return await PackageItem.create({ packageId, productId, quantity });
  },

  updateItemQuantity: async (packageId, itemId, quantity) => {
    const item = await PackageItem.findOne({ where: { id: itemId, packageId } });
    if (!item) throw new Error("Package item not found");
    await item.update({ quantity });
    return item;
  },

  removeItem: async (packageId, itemId) => {
    const item = await PackageItem.findOne({ where: { id: itemId, packageId } });
    if (!item) throw new Error("Package item not found");
    await item.destroy();
    return item;
  },

  replaceAllItems: async (packageId, items) => {
    const pkg = await Package.findByPk(packageId);
    if (!pkg) throw new Error("Package not found");

    const t = await sequelize.transaction();
    try {
      await PackageItem.destroy({ where: { packageId }, transaction: t });

      const created = await PackageItem.bulkCreate(
        items.map((i) => ({ packageId, productId: i.productId, quantity: i.quantity })),
        { transaction: t }
      );

      await t.commit();
      return created;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  getProductForItem: async (itemId) => {
    const item = await PackageItem.findByPk(itemId);
    if (!item) throw new Error("Package item not found");
    return await Product.findByPk(item.productId);
  },

  getPackageForItem: async (itemId) => {
    const item = await PackageItem.findByPk(itemId);
    if (!item) throw new Error("Package item not found");
    return await Package.findByPk(item.packageId);
  },
};

module.exports = packageItemExtendedRepository;