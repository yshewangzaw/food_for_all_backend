const commissionRuleExtendedRepository = require("../repositories/commissionRuleExtendedRepository");

const commissionRuleExtendedService = {
  getLevelConfiguration: async (ruleId) =>
    commissionRuleExtendedRepository.getLevelConfiguration(ruleId),

  getCommissions: async (ruleId, period) =>
    commissionRuleExtendedRepository.getCommissions(ruleId, period),
  getActiveRules: async () => commissionRuleExtendedRepository.getActiveRules(),
  activate: async (ruleId) =>
    commissionRuleExtendedRepository.setActive(ruleId, true),
  deactivate: async (ruleId) =>
    commissionRuleExtendedRepository.setActive(ruleId, false),
  findFiltered: async (query) =>
    commissionRuleExtendedRepository.findFiltered(query),
};

module.exports = commissionRuleExtendedService;
