
const networkFilterService = require("../services/networkFilterService");
const networkRelationshipService = require("../services/networkRelationshipService");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const networkRelationshipController = {
  getAncestors: async (req, res) => {
    try {
      const ancestors = await networkRelationshipService.getAncestors(req.params.userId);
      ok(res, ancestors);
    } catch (error) {
      fail(res, 500, error);
    }
  },

getDescendants: async (req, res) => {
  try {
    const descendants = await networkFilterService.findDescendantsFiltered(
      req.params.userId,
      req.query
    );
    res.json({ success: true, data: descendants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
},

// Everything else in networkRelationshipController.js stays the same.
  getAtLevel: async (req, res) => {
    try {
      const level = parseInt(req.params.level);
      const users = await networkRelationshipService.getAtLevel(req.params.userId, level);
      ok(res, users);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getRelationship: async (req, res) => {
    try {
      const result = await networkRelationshipService.getRelationship(
        req.params.userId,
        req.params.otherId
      );
      ok(res, result);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  // --- PASS 3: STEP 1 - Path-To Query ---
  getPathBetween: async (req, res) => {
    try {
      const { ancestorId, descendantId } = req.params;
      const pathData = await networkRelationshipService.getPathBetween(
        ancestorId,
        descendantId
      );

      if (!pathData) {
        return res.status(404).json({
          success: false,
          message: `No active sponsorship relationship found between user ${ancestorId} and ${descendantId}.`,
        });
      }

      ok(res, pathData);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  // --- PASS 3: STEP 2 - Recruiter Leaderboard ---
  getRecruiterLeaderboard: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 20;
      const period = req.query.period; // YYYY-MM
      const leaderboard = await networkRelationshipService.getRecruiterLeaderboard(
        period,
        limit
      );
      ok(res, leaderboard);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  // --- PASS 3: STEP 2 - Top Earners Leaderboard ---
  getTopEarnersLeaderboard: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 20;
      const period = req.query.period; // YYYY-MM
      const topEarners = await networkRelationshipService.getTopEarnersLeaderboard(
        period,
        limit
      );
      ok(res, topEarners);
    } catch (error) {
      fail(res, 500, error);
    }
  },
};

module.exports = networkRelationshipController;