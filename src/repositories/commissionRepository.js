const { Commission, User } = require("../models");

const commissionRepository = {
  findAll: async () => {
    return await Commission.findAll({
      include: [
        { model: User, as: "beneficiaryUser" },
        { model: User, as: "sourceUser" },
      ],
    });
  },

  findByUserId: async (beneficiaryUserId) => {
    return await Commission.findAll({
      where: { beneficiaryUserId },
      include: [
        { model: User, as: "beneficiaryUser" },
        { model: User, as: "sourceUser" },
      ],
    });
  },

  findById: async (id) => {
    return await Commission.findByPk(id, {
      include: [
        { model: User, as: "beneficiaryUser" },
        { model: User, as: "sourceUser" },
      ],
    });
  },

  create: async (data) => {
    return await Commission.create(data);
  },

  update: async (id, data) => {
    const commission = await Commission.findByPk(id);
    if (!commission) return null;
    await commission.update(data);
    return await Commission.findByPk(id, {
      include: [
        { model: User, as: "beneficiaryUser" },
        { model: User, as: "sourceUser" },
      ],
    });
  },

  delete: async (id) => {
    const commission = await Commission.findByPk(id);
    if (!commission) return null;
    await commission.destroy();
    return commission;
  },
};

module.exports = commissionRepository;