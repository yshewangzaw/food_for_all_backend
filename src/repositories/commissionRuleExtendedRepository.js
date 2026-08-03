const commissionRuleRepository = require("./commissionRuleRepository");

const commissionRuleExtendedRepository = {
  getLevelConfiguration: async (ruleId) => ({ ruleId }),
  getCommissions: async (ruleId, period) => ({ ruleId, period }),
  getActiveRules: async () => [],
  setActive: async (ruleId, active) => ({ ruleId, active }),
  findFiltered: async (query) => ({ rows: [], total: 0 }),
};

module.exports = commissionRuleExtendedRepository;
