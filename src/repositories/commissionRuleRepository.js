const { CommissionRule } = require("../models");

const commissionRuleRepository = {
  findAll: async () => {
    return await CommissionRule.findAll();
  },

  findById: async (id) => {
    return await CommissionRule.findByPk(id);
  },

  create: async (data) => {
    return await CommissionRule.create(data);
  },

  update: async (id, data) => {
    const rule = await CommissionRule.findByPk(id);
    if (!rule) return null;
    await rule.update(data);
    return await CommissionRule.findByPk(id);
  },

  delete: async (id) => {
    const rule = await CommissionRule.findByPk(id);
    if (!rule) return null;
    await rule.destroy();
    return rule;
  },
};

module.exports = commissionRuleRepository;