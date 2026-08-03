const { OrderItem, Order, Product, Package } = require("../models");

const orderItemRepository = {
  findAll: async () => {
    return await OrderItem.findAll({
      include: [
        { model: Product, as: "product", attributes: ["id", "name", "sku"] },
        { model: Package, as: "package", attributes: ["id", "name", "code"] },
      ],
    });
  },

  findByOrderId: async (orderId) => {
    return await OrderItem.findAll({
      where: { orderId },
      include: [
        { model: Product, as: "product", attributes: ["id", "name", "sku"] },
        { model: Package, as: "package", attributes: ["id", "name", "code"] },
      ],
    });
  },

  findById: async (id) => {
    return await OrderItem.findByPk(id, {
      include: [
        { model: Product, as: "product", attributes: ["id", "name", "sku"] },
        { model: Package, as: "package", attributes: ["id", "name", "code"] },
      ],
    });
  },

  create: async (data) => {
    return await OrderItem.create(data);
  },

  update: async (id, data) => {
    const item = await OrderItem.findByPk(id);
    if (!item) return null;
    await item.update(data);
    return await OrderItem.findByPk(id);
  },

  delete: async (id) => {
    const item = await OrderItem.findByPk(id);
    if (!item) return null;
    await item.destroy();
    return item;
  },
};

module.exports = orderItemRepository;