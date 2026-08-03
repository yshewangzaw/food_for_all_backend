const walletExtendedRepository = require("../repositories/walletExtendedRepository");

const walletExtendedService = {
  getBalance: (userId) => walletExtendedRepository.getBalance(userId),
  getTransactions: (userId, query) =>
    walletExtendedRepository.getTransactions(userId, query),
  getReference: (id) => walletExtendedRepository.getReference(id),
  getCreatedBy: (id) => walletExtendedRepository.getCreatedBy(id),
  getStatement: (userId, query) =>
    walletExtendedRepository.getStatement(userId, query),

  adjust: (data, adminId) => walletExtendedRepository.adjust(data, adminId),
  reverse: (data, adminId) => walletExtendedRepository.reverse(data, adminId),

  reconcile: () => walletExtendedRepository.reconcile(),
  getLiability: () => walletExtendedRepository.getLiability(),

  findFiltered: (query) => walletExtendedRepository.findFiltered(query),
};

module.exports = walletExtendedService;