const { Payment, PaymentMethod, Order, User } = require("../models");

const paymentRepository = {
  findAll: async () => {
    return await Payment.findAll({
      include: [
        { model: PaymentMethod },
        { model: Order },
        { model: User, as: "payer" },
        { model: User, as: "reviewer" },
      ],
    });
  },
  findById: async (id) => {
    return await Payment.findByPk(id, {
      include: [
        { model: PaymentMethod },
        { model: Order },
        { model: User, as: "payer" },
        { model: User, as: "reviewer" },
      ],
    });
  },
  create: async (data) => await Payment.create(data),
  update: async (id, data) => {
    const payment = await Payment.findByPk(id);
    if (!payment) return null;
    await payment.update(data);
    return await Payment.findByPk(id, {
      include: [
        { model: PaymentMethod },
        { model: Order },
        { model: User, as: "payer" },
        { model: User, as: "reviewer" },
      ],
    });
  },
  delete: async (id) => {
    const payment = await Payment.findByPk(id);
    if (!payment) return null;
    await payment.destroy();
    return payment;
  },
};

module.exports = paymentRepository;