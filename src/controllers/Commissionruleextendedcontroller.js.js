const commissionRuleExtendedService = require("../services/commissionRuleExtendedService");
const commissionExtendedService = require("../services/commissionExtendedService");
const { LevelConfiguration, CommissionRule } = require("../models");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const commissionRuleExtendedController = {
  getLevelConfiguration: async (req, res) => {
    try {
      ok(
        res,
        await commissionRuleExtendedService.getLevelConfiguration(
          req.params.id,
        ),
      );
    } catch (error) {
      fail(res, 404, error);
    }
  },

  getCommissions: async (req, res) => {
    try {
      ok(
        res,
        await commissionRuleExtendedService.getCommissions(
          req.params.id,
          req.query.period,
        ),
      );
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getActiveRules: async (req, res) => {
    try {
      ok(res, await commissionRuleExtendedService.getActiveRules());
    } catch (error) {
      fail(res, 500, error);
    }
  },

  activate: async (req, res) => {
    try {
      ok(res, await commissionRuleExtendedService.activate(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  deactivate: async (req, res) => {
    try {
      ok(res, await commissionRuleExtendedService.deactivate(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  findFiltered: async (req, res) => {
    try {
      ok(res, await commissionRuleExtendedService.findFiltered(req.query));
    } catch (error) {
      fail(res, 500, error);
    }
  },

  simulate: async (req, res) => {
    try {
      const { buyerUserId, orderAmount, orderPv } = req.body;
      const result = await commissionExtendedService.simulate(
        buyerUserId,
        orderAmount,
        orderPv,
      );
      ok(res, result);
    } catch (error) {
      fail(res, 400, error);
    }
  },

  validate: async (req, res) => {
    try {
      const activeConfig = await LevelConfiguration.findOne({
        where: { isActive: true },
      });
      if (!activeConfig) {
        return res.json({
          success: true,
          data: { valid: false, issues: ["No active LevelConfiguration"] },
        });
      }

      const rules = await CommissionRule.findAll({
        where: { levelConfigurationId: activeConfig.id, isActive: true },
      });

      const issues = [];

      // Gap check: is every level 1..maximumDepth covered by a REFERRAL rule?
      const referralLevels = rules
        .filter((r) => r.commissionType === "REFERRAL")
        .map((r) => r.level);
      for (let lvl = 1; lvl <= activeConfig.maximumDepth; lvl++) {
        if (!referralLevels.includes(lvl)) {
          issues.push(`No REFERRAL rule covers level ${lvl}`);
        }
      }

      // Overlap check: more than one rule targeting the same level
      const levelCounts = {};
      for (const lvl of referralLevels) {
        levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
      }
      for (const [lvl, count] of Object.entries(levelCounts)) {
        if (count > 1)
          issues.push(`Level ${lvl} has ${count} overlapping REFERRAL rules`);
      }

      // Total payout percentage sanity check (percentage-type rules only)
      const totalPercentage = rules
        .filter((r) => r.rateType === "PERCENTAGE")
        .reduce((sum, r) => sum + parseFloat(r.rateValue), 0);
      if (totalPercentage > 100) {
        issues.push(
          `Total commission percentage across active rules is ${totalPercentage}%, exceeding 100% of order value`,
        );
      }

      res.json({
        success: true,
        data: { valid: issues.length === 0, totalPercentage, issues },
      });
    } catch (error) {
      fail(res, 500, error);
    }
  },
};

module.exports = commissionRuleExtendedController;
