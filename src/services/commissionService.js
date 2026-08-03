const commissionRepository = require("../repositories/commissionRepository");

const commissionService = {
  getAll: async () => {
    return await commissionRepository.findAll();
  },

  getByUserId: async (userId) => {
    return await commissionRepository.findByUserId(userId);
  },

  getById: async (id) => {
    const commission = await commissionRepository.findById(id);
    if (!commission) throw new Error("Commission record not found");
    return commission;
  },

  create: async (data) => {
    return await commissionRepository.create(data);
  },

  update: async (id, data) => {
    const commission = await commissionRepository.update(id, data);
    if (!commission) throw new Error("Commission record not found");
    return commission;
  },

  delete: async (id) => {
    const commission = await commissionRepository.delete(id);
    if (!commission) throw new Error("Commission record not found");
    return commission;
  },
};

module.exports = commissionService;