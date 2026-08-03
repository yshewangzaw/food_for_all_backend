const { User } = require("../models");
const { Op } = require("sequelize");

const userRepository = {
  // ---- Generic CRUD (used by userService) ----

  findAll: async () => {
    return await User.findAll();
  },

  findById: async (id) => {
    return await User.findByPk(id);
  },

  update: async (id, data) => {
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.update(data);
    return user;
  },

  delete: async (id) => {
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.destroy();
    return user;
  },

  // ---- Auth / registration-specific queries (used by authService) ----

  findByReferralCode: async (referralCode, transaction) => {
    return await User.findOne({
      where: { referralCode },
      transaction,
    });
  },

  findByEmail: async (email) => {
    return await User.findOne({ where: { email } });
  },

  findByEmailOrPhone: async (email, phone, transaction) => {
    return await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
      transaction,
    });
  },

  incrementDirectReferralCount: async (userId, transaction) => {
    const user = await User.findByPk(userId, { transaction });
    if (!user) return null;
    await user.increment("directReferralCount", { transaction });
    return user;
  },

  // ---- create() supports BOTH callers ----
  // userService calls create(data)            -> no transaction
  // authService calls create(data, t)          -> with transaction
  create: async (data, transaction) => {
    return await User.create(data, { transaction });
  },
};

module.exports = userRepository;