const orderRepository = require("../repositories/orderRepository");

const orderService = {
  getAll: async () => {
    return await orderRepository.findAll();
  },

  getById: async (id) => {
    const order = await orderRepository.findById(id);
    if (!order) throw new Error("Order not found");
    return order;
  },

  create: async (data) => {
    return await orderRepository.create(data);
  },

  update: async (id, data) => {
    const order = await orderRepository.update(id, data);
    if (!order) throw new Error("Order not found");
    return order;
  },

  delete: async (id) => {
    const order = await orderRepository.delete(id);
    if (!order) throw new Error("Order not found");
    return order;
  },
};

module.exports = orderService;