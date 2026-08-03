const paymentMethodRepository = require("../repositories/paymentMethodRepository");

const paymentMethodService = {
  getAll: async () => await paymentMethodRepository.findAll(),
  getById: async (id) => {
    const res = await paymentMethodRepository.findById(id);
    if (!res) throw new Error("Payment method not found");
    return res;
  },
  create: async (data) => await paymentMethodRepository.create(data),
  update: async (id, data) => {
    const res = await paymentMethodRepository.update(id, data);
    if (!res) throw new Error("Payment method not found");
    return res;
  },
  delete: async (id) => {
    const res = await paymentMethodRepository.delete(id);
    if (!res) throw new Error("Payment method not found");
    return res;
  },
};

module.exports = paymentMethodService;