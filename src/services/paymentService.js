const paymentRepository = require("../repositories/paymentRepository");

const paymentService = {
  getAll: async () => await paymentRepository.findAll(),
  getById: async (id) => {
    const res = await paymentRepository.findById(id);
    if (!res) throw new Error("Payment record not found");
    return res;
  },
  create: async (data) => await paymentRepository.create(data),
  update: async (id, data) => {
    const res = await paymentRepository.update(id, data);
    if (!res) throw new Error("Payment record not found");
    return res;
  },
  delete: async (id) => {
    const res = await paymentRepository.delete(id);
    if (!res) throw new Error("Payment record not found");
    return res;
  },
};

module.exports = paymentService;