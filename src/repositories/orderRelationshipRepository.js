const {
  Order,
  OrderItem,
  Payment,
  Commission,
  User,
  Product,
  Package,
} = require("../models");

const orderRelationshipRepository = {
  getItems: async (orderId) => {
    return await OrderItem.findAll({ where: { orderId } });
  },

  getPayments: async (orderId) => {
    return await Payment.findAll({
      where: { orderId },
      order: [["createdAt", "DESC"]],
    });
  },

  getCommissions: async (orderId) => {
    return await Commission.findAll({ where: { orderId } });
  },

  getBuyer: async (orderId) => {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error("Order not found");
    if (!order.buyerUserId) return null;
    return await User.findByPk(order.buyerUserId);
  },

  getOrderItemProduct: async (orderItemId) => {
    const item = await OrderItem.findByPk(orderItemId);
    if (!item) throw new Error("Order item not found");
    if (!item.productId) return null;
    return await Product.findByPk(item.productId);
  },

  getOrderItemPackage: async (orderItemId) => {
    const item = await OrderItem.findByPk(orderItemId);
    if (!item) throw new Error("Order item not found");
    if (!item.packageId) return null;
    return await Package.findByPk(item.packageId);
  },
};

module.exports = orderRelationshipRepository;
