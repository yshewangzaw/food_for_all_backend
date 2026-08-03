const commissionRuleRepository = require("../repositories/commissionRuleRepository");

const commissionRuleService = {
  getAll: async () => {
    return await commissionRuleRepository.findAll();
  },

  getById: async (id) => {
    const rule = await commissionRuleRepository.findById(id);
    if (!rule) throw new Error("Commission rule not found");
    return rule;
  },

  create: async (data) => {
    return await commissionRuleRepository.create(data);
  },

  update: async (id, data) => {
    const rule = await commissionRuleRepository.update(id, data);
    if (!rule) throw new Error("Commission rule not found");
    return rule;
  },

  delete: async (id) => {
    const rule = await commissionRuleRepository.delete(id);
    if (!rule) throw new Error("Commission rule not found");
    return rule;
  },
};

module.exports = commissionRuleService;