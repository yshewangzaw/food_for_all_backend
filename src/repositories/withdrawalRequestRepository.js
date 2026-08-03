const { WithdrawalRequest, User, PaymentMethod } = require("../models");

const withdrawalRequestRepository = {
  findAll: async () => {
    return await WithdrawalRequest.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "fullName", "email"] },
        { model: PaymentMethod, attributes: ["id", "name", "code", "methodType"] },
      ],
      order: [["createdAt", "DESC"]],
    });
  },

  findByUserId: async (userId) => {
    return await WithdrawalRequest.findAll({
      where: { userId },
      include: [
        { model: PaymentMethod, attributes: ["id", "name", "code", "methodType"] },
      ],
      order: [["createdAt", "DESC"]],
    });
  },

  findById: async (id) => {
    return await WithdrawalRequest.findByPk(id, {
      include: [
        { model: User, as: "user", attributes: ["id", "fullName", "email"] },
        { model: PaymentMethod, attributes: ["id", "name", "code", "methodType"] },
      ],
    });
  },

  create: async (data) => {
    return await WithdrawalRequest.create(data);
  },

  update: async (id, data) => {
    const request = await WithdrawalRequest.findByPk(id);
    if (!request) return null;
    await request.update(data);
    return await WithdrawalRequest.findByPk(id, {
      include: [
        { model: User, as: "user", attributes: ["id", "fullName", "email"] },
        { model: PaymentMethod, attributes: ["id", "name", "code", "methodType"] },
      ],
    });
  },

  delete: async (id) => {
    const request = await WithdrawalRequest.findByPk(id);
    if (!request) return null;
    await request.destroy();
    return request;
  },
};

module.exports = withdrawalRequestRepository;