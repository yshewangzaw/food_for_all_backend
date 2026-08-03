const withdrawalRequestRepository = require("../repositories/withdrawalRequestRepository");

const withdrawalRequestService = {
  getAll: async () => {
    return await withdrawalRequestRepository.findAll();
  },

  getByUserId: async (userId) => {
    return await withdrawalRequestRepository.findByUserId(userId);
  },

  getById: async (id) => {
    const request = await withdrawalRequestRepository.findById(id);
    if (!request) throw new Error("Withdrawal request not found");
    return request;
  },

  create: async (data) => {
    return await withdrawalRequestRepository.create(data);
  },

  update: async (id, data) => {
    const request = await withdrawalRequestRepository.update(id, data);
    if (!request) throw new Error("Withdrawal request not found");
    return request;
  },

  delete: async (id) => {
    const request = await withdrawalRequestRepository.delete(id);
    if (!request) throw new Error("Withdrawal request not found");
    return request;
  },
};

module.exports = withdrawalRequestService;