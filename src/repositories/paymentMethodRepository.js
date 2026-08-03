const { PaymentMethod } = require("../models");

const paymentMethodRepository = {
  findAll: async () => await PaymentMethod.findAll(),
  findById: async (id) => await PaymentMethod.findByPk(id),
  create: async (data) => await PaymentMethod.create(data),
  update: async (id, data) => {
    const item = await PaymentMethod.findByPk(id);
    if (!item) return null;
    await item.update(data);
    return await PaymentMethod.findByPk(id);
  },
  delete: async (id) => {
    const item = await PaymentMethod.findByPk(id);
    if (!item) return null;
    await item.destroy();
    return item;
  },
};

module.exports = paymentMethodRepository;