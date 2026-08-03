const {
  Commission,
  User,
  CommissionRule,
  Order,
  WalletTransaction,
} = require("../models");

const commissionRelationshipRepository = {
  getBeneficiary: async (commissionId) => {
    const c = await Commission.findByPk(commissionId);
    if (!c) throw new Error("Commission not found");
    return await User.findByPk(c.beneficiaryUserId);
  },

  getSourceUser: async (commissionId) => {
    const c = await Commission.findByPk(commissionId);
    if (!c) throw new Error("Commission not found");
    return await User.findByPk(c.sourceUserId);
  },

  getRule: async (commissionId) => {
    const c = await Commission.findByPk(commissionId);
    if (!c) throw new Error("Commission not found");
    if (!c.commissionRuleId) return null;
    return await CommissionRule.findByPk(c.commissionRuleId);
  },

  getOrder: async (commissionId) => {
    const c = await Commission.findByPk(commissionId);
    if (!c) throw new Error("Commission not found");
    if (!c.orderId) return null;
    return await Order.findByPk(c.orderId);
  },

  getWalletTransaction: async (commissionId) => {
    return await WalletTransaction.findOne({
      where: { referenceType: "COMMISSION", referenceId: commissionId },
    });
  },
};

module.exports = commissionRelationshipRepository;
