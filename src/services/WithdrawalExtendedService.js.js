const withdrawalExtendedRepository = require("../repositories/withdrawalExtendedRepository");

const withdrawalExtendedService = {
  getUser: (id) => withdrawalExtendedRepository.getUser(id),
  getPaymentMethod: (id) => withdrawalExtendedRepository.getPaymentMethod(id),
  getWalletTransactions: (id) =>
    withdrawalExtendedRepository.getWalletTransactions(id),

  getEligibility: (userId) =>
    withdrawalExtendedRepository.getEligibility(userId),
  create: (data) => withdrawalExtendedRepository.create(data),
  cancel: (id, userId) => withdrawalExtendedRepository.cancel(id, userId),

  review: (id, adminId) => withdrawalExtendedRepository.review(id, adminId),
  approve: (id, adminId) => withdrawalExtendedRepository.approve(id, adminId),
  reject: (id, adminId, reason) =>
    withdrawalExtendedRepository.reject(id, adminId, reason),
  markPaid: (id, adminId, data) =>
    withdrawalExtendedRepository.markPaid(id, adminId, data),
  bulkMarkPaid: (items, adminId) =>
    withdrawalExtendedRepository.bulkMarkPaid(items, adminId),

  getQueue: (status) => withdrawalExtendedRepository.getQueue(status),
  getPayoutBatch: (date) => withdrawalExtendedRepository.getPayoutBatch(date),

  findFiltered: (query) => withdrawalExtendedRepository.findFiltered(query),
};

module.exports = withdrawalExtendedService;