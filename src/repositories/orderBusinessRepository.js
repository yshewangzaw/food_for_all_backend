const {
  Order,
  OrderItem,
  Package,
  Product,
  Payment,
  User,
  PaymentMethod,
} = require("../models");
const sequelize = require("../config/database");
const { Op } = require("sequelize");
const commissionBusinessRepository = require("./commissionBusinessRepository");

const priceCart = async (items) => {
  const lines = [];
  let subtotal = 0;
  let totalPv = 0;

  for (const item of items) {
    if (item.packageId) {
      const pkg = await Package.findByPk(item.packageId);
      if (!pkg || !pkg.isActive)
        throw new Error(`Package ${item.packageId} not found or inactive`);
      const lineTotal = parseFloat(pkg.price) * item.quantity;
      const linePv = parseFloat(pkg.pvValue) * item.quantity;
      lines.push({
        itemType: "PACKAGE",
        packageId: pkg.id,
        productId: null,
        itemName: pkg.name,
        unitPrice: pkg.price,
        quantity: item.quantity,
        pvTotal: linePv,
      });
      subtotal += lineTotal;
      totalPv += linePv;
    } else if (item.productId) {
      const product = await Product.findByPk(item.productId);
      if (!product || !product.isActive)
        throw new Error(`Product ${item.productId} not found or inactive`);
      const lineTotal = parseFloat(product.unitPrice) * item.quantity;
      const linePv = parseFloat(product.pvValue) * item.quantity;
      lines.push({
        itemType: "PRODUCT",
        packageId: null,
        productId: product.id,
        itemName: product.name,
        unitPrice: product.unitPrice,
        quantity: item.quantity,
        pvTotal: linePv,
      });
      subtotal += lineTotal;
      totalPv += linePv;
    } else {
      throw new Error("Each cart item needs either packageId or productId");
    }
  }

  return { lines, subtotal, totalAmount: subtotal, totalPv };
};

const generateOrderNumber = async (transaction) => {
  const year = new Date().getFullYear();
  const countThisYear = await Order.count({
    where: { orderNumber: { [Op.like]: `ORD-${year}-%` } },
    transaction,
  });
  const nextSeq = String(countThisYear + 1).padStart(4, "0");
  return `ORD-${year}-${nextSeq}`;
};

const orderBusinessRepository = {
  quote: async (items) => {
    const { lines, subtotal, totalAmount, totalPv } = await priceCart(items);
    const paymentMethods = await PaymentMethod.findAll({
      where: { isActive: true },
    });
    return {
      lines,
      subtotal,
      totalAmount,
      totalPv,
      availablePaymentMethods: paymentMethods,
    };
  },

  checkout: async (buyerUserId, orderType, items, note) => {
    const t = await sequelize.transaction();
    try {
      const { lines, subtotal, totalAmount, totalPv } = await priceCart(items);
      const orderNumber = await generateOrderNumber(t);

      const order = await Order.create(
        {
          orderNumber,
          orderType,
          buyerUserId,
          subtotal,
          totalAmount,
          totalPv,
          status: "PENDING_PAYMENT",
          commissionStatus: "NOT_PROCESSED",
          note: note || null,
        },
        { transaction: t },
      );

      await OrderItem.bulkCreate(
        lines.map((l) => ({ ...l, orderId: order.id })),
        { transaction: t },
      );

      const paymentMethods = await PaymentMethod.findAll({
        where: { isActive: true },
        transaction: t,
      });

      await t.commit();

      return {
        order,
        items: lines,
        payableAmount: totalAmount,
        paymentMethods,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  cancel: async (orderId) => {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error("Order not found");
    if (order.status !== "PENDING_PAYMENT") {
      throw new Error(`Cannot cancel an order with status ${order.status}`);
    }

    const approvedPayment = await Payment.findOne({
      where: { orderId, status: "APPROVED" },
    });
    if (approvedPayment) {
      throw new Error(
        "Cannot cancel — a payment has already been approved for this order",
      );
    }

    await order.update({ status: "CANCELLED" });
    return order;
  },

  refund: async (orderId, reason) => {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error("Order not found");
    if (order.status !== "PAID") {
      throw new Error(`Cannot refund an order with status ${order.status}`);
    }

    await order.update({ status: "REFUNDED", commissionStatus: "REVERSED" });

    const reversed = await commissionBusinessRepository.reverseOrder(
      orderId,
      reason || "Order refunded",
    );

    return { order, commissionsReversed: reversed.length };
  },

  getInvoiceData: async (orderId) => {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error("Order not found");

    const items = await OrderItem.findAll({ where: { orderId } });
    const buyer = order.buyerUserId
      ? await User.findByPk(order.buyerUserId)
      : null;

    return { order, items, buyer };
  },

  getCurrentMonthOrder: async (userId) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const order = await Order.findOne({
      where: {
        buyerUserId: userId,
        status: "PAID",
        createdAt: { [Op.gte]: monthStart, [Op.lt]: monthEnd },
      },
    });

    return { hasOrderedThisMonth: !!order, order };
  },

  getNextOrderNumber: async () => {
    return await generateOrderNumber();
  },

  recalculatePv: async (orderId) => {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error("Order not found");

    const items = await OrderItem.findAll({ where: { orderId } });
    const subtotal = items.reduce(
      (sum, i) => sum + parseFloat(i.unitPrice) * i.quantity,
      0,
    );
    const totalPv = items.reduce(
      (sum, i) => sum + parseFloat(i.pvTotal || 0),
      0,
    );

    await order.update({ subtotal, totalAmount: subtotal, totalPv });
    return order;
  },
};

module.exports = orderBusinessRepository;
