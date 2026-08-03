const { CommissionRule, LevelConfiguration, Commission } = require("../models");
const { Op } = require("sequelize");

const commissionRuleExtendedRepository = {
  getLevelConfiguration: async (ruleId) => {
    const rule = await CommissionRule.findByPk(ruleId);
    if (!rule) throw new Error("Commission rule not found");
    return await LevelConfiguration.findByPk(rule.levelConfigurationId);
  },

  getCommissions: async (ruleId, period) => {
    const where = { commissionRuleId: ruleId };
    if (period) {
      // period format: "2026-07"
      const [year, month] = period.split("-").map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      where.createdAt = { [Op.gte]: start, [Op.lt]: end };
    }
    return await Commission.findAll({ where, order: [["createdAt", "DESC"]] });
  },

  getActiveRules: async () => {
    return await CommissionRule.findAll({ where: { isActive: true } });
  },

  setActive: async (ruleId, isActive) => {
    const rule = await CommissionRule.findByPk(ruleId);
    if (!rule) throw new Error("Commission rule not found");
    await rule.update({ isActive });
    return rule;
  },

  findFiltered: async (query) => {
    const where = {};
    if (query.commissionType) where.commissionType = query.commissionType;
    if (query.levelConfigurationId)
      where.levelConfigurationId = query.levelConfigurationId;
    if (query.isActive === "true") where.isActive = true;
    if (query.isActive === "false") where.isActive = false;

    if (query.minPV || query.maxPV) {
      where.minimumPV = {};
      if (query.minPV) where.minimumPV[Op.gte] = query.minPV;
      if (query.maxPV) where.minimumPV[Op.lte] = query.maxPV;
    }

    return await CommissionRule.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
  },
};

module.exports = commissionRuleExtendedRepository;
