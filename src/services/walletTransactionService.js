const walletTransactionRepository = require("../repositories/walletTransactionRepository");

const walletTransactionService = {
  getAll: async () => {
    return await walletTransactionRepository.findAll();
  },

  getByUserId: async (userId) => {
    return await walletTransactionRepository.findByUserId(userId);
  },

  getById: async (id) => {
    const tx = await walletTransactionRepository.findById(id);
    if (!tx) throw new Error("Wallet transaction not found");
    return tx;
  },

  create: async (data) => {
    return await walletTransactionRepository.create(data);
  },

  getUserBalance: async (userId) => {
    const transactions = await walletTransactionRepository.findByUserId(userId);
    const balance = transactions.reduce((acc, tx) => {
      const amount = parseFloat(tx.amount);
      return tx.type === "CREDIT" ? acc + amount : acc - amount;
    }, 0);
    return balance;
  },
};

module.exports = walletTransactionService;