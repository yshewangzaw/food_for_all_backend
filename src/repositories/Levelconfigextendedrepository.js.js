const { LevelConfiguration, CommissionRule } = require("../models");
const sequelize = require("../config/database");
const { Op } = require("sequelize");

const levelConfigExtendedRepository = {
  getRules: async (id) => {
    return await CommissionRule.findAll({
      where: { levelConfigurationId: id },
    });
  },

  getActive: async () => {
    return await LevelConfiguration.findOne({ where: { isActive: true } });
  },

  activate: async (id) => {
    const t = await sequelize.transaction();
    try {
      const config = await LevelConfiguration.findByPk(id, { transaction: t });
      if (!config) throw new Error("Level configuration not found");

      // Only one active at a time — deactivate everything else first
      await LevelConfiguration.update(
        { isActive: false },
        { where: { id: { [Op.ne]: id } }, transaction: t },
      );
      await config.update({ isActive: true }, { transaction: t });

      await t.commit();
      return config;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  deactivate: async (id) => {
    const config = await LevelConfiguration.findByPk(id);
    if (!config) throw new Error("Level configuration not found");
    await config.update({ isActive: false });
    return config;
  },

  clone: async (id) => {
    const t = await sequelize.transaction();
    try {
      const original = await LevelConfiguration.findByPk(id, {
        transaction: t,
      });
      if (!original) throw new Error("Level configuration not found");

      const clone = await LevelConfiguration.create(
        {
          name: `${original.name} (copy)`,
          description: original.description,
          maximumDepth: original.maximumDepth,
          isCommissionEligible: original.isCommissionEligible,
          isActive: false, // clone is always a draft, never auto-activated
        },
        { transaction: t },
      );

      const originalRules = await CommissionRule.findAll({
        where: { levelConfigurationId: id },
        transaction: t,
      });

      const clonedRules = await CommissionRule.bulkCreate(
        originalRules.map((r) => ({
          name: r.name,
          commissionType: r.commissionType,
          levelConfigurationId: clone.id,
          minimumPV: r.minimumPV,
          maximumCommissionAmount: r.maximumCommissionAmount,
          isActive: false, // draft rules too
          description: r.description,
        })),
        { transaction: t },
      );

      await t.commit();
      return { clone, rulesCloned: clonedRules.length };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  findFiltered: async (query) => {
    const where = {};
    if (query.isActive === "true") where.isActive = true;
    if (query.isActive === "false") where.isActive = false;
    if (query.isCommissionEligible === "true")
      where.isCommissionEligible = true;
    if (query.isCommissionEligible === "false")
      where.isCommissionEligible = false;
    if (query.maxDepth) where.maximumDepth = query.maxDepth;

    return await LevelConfiguration.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
  },
};

module.exports = levelConfigExtendedRepository;
