const { WalletTransaction, User } = require("../models");

const walletTransactionRepository = {
  findAll: async () => {
    return await WalletTransaction.findAll({
      include: [{ model: User }],
    });
  },

  findByUserId: async (userId) => {
    return await WalletTransaction.findAll({
      where: { userId },
      include: [{ model: User }],
    });
  },

  findById: async (id) => {
    return await WalletTransaction.findByPk(id, {
      include: [{ model: User }],
    });
  },

  create: async (data) => {
    return await WalletTransaction.create(data);
  },

  delete: async (id) => {
    const tx = await WalletTransaction.findByPk(id);
    if (!tx) return null;
    await tx.destroy();
    return tx;
  },
};

module.exports = walletTransactionRepository;