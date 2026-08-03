const orderItemRepository = require("../repositories/orderItemRepository");

const orderItemService = {
  getAll: async () => {
    return await orderItemRepository.findAll();
  },

  getByOrderId: async (orderId) => {
    return await orderItemRepository.findByOrderId(orderId);
  },

  getById: async (id) => {
    const item = await orderItemRepository.findById(id);
    if (!item) throw new Error("Order item not found");
    return item;
  },

  create: async (data) => {
    return await orderItemRepository.create(data);
  },

  update: async (id, data) => {
    const item = await orderItemRepository.update(id, data);
    if (!item) throw new Error("Order item not found");
    return item;
  },

  delete: async (id) => {
    const item = await orderItemRepository.delete(id);
    if (!item) throw new Error("Order item not found");
    return item;
  },
};

module.exports = orderItemService;