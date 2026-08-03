const packageItemRepository = require("../repositories/packageItemRepository");

const packageItemService = {
  getAll: async () => {
    return await packageItemRepository.findAll();
  },

  getById: async (id) => {
    const item = await packageItemRepository.findById(id);
    if (!item) throw new Error("Package item not found");
    return item;
  },

  create: async (data) => {
    return await packageItemRepository.create(data);
  },

  update: async (id, data) => {
    const item = await packageItemRepository.update(id, data);
    if (!item) throw new Error("Package item not found");
    return item;
  },

  delete: async (id) => {
    const item = await packageItemRepository.delete(id);
    if (!item) throw new Error("Package item not found");
    return item;
  },
};

module.exports = packageItemService;