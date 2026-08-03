const { PaymentMethod, Payment } = require("../models");
const { Op } = require("sequelize");

const paymentMethodExtendedRepository = {
  getPayments: async (id) => {
    return await Payment.findAll({ where: { paymentMethodId: id } });
  },

  getActive: async () => {
    return await PaymentMethod.findAll({ where: { isActive: true } });
  },

  getAvailableForAmount: async (amount) => {
    return await PaymentMethod.findAll({
      where: {
        isActive: true,
        [Op.and]: [
          {
            [Op.or]: [{ minAmount: null }, { minAmount: { [Op.lte]: amount } }],
          },
          {
            [Op.or]: [{ maxAmount: null }, { maxAmount: { [Op.gte]: amount } }],
          },
        ],
      },
    });
  },

  setActive: async (id, isActive) => {
    const method = await PaymentMethod.findByPk(id);
    if (!method) throw new Error("Payment method not found");
    await method.update({ isActive });
    return method;
  },
};

module.exports = paymentMethodExtendedRepository;
