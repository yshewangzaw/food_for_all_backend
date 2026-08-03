const networkBusinessService = require("../services/networkBusinessService");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const networkBusinessController = {
  getTree: async (req, res) => {
    try {
      const depth = Math.min(parseInt(req.query.depth) || 3, 3); // hard cap at 3 per business rule
      const tree = await networkBusinessService.getTree(req.params.userId, depth);
      ok(res, tree);
    } catch (error) {
      fail(res, 404, error);
    }
  },

  getMyTree: async (req, res) => {
    try {
      const depth = Math.min(parseInt(req.query.depth) || 3, 3);
      const tree = await networkBusinessService.getTree(req.user.id, depth);
      ok(res, tree);
    } catch (error) {
      fail(res, 404, error);
    }
  },

  getStats: async (req, res) => {
    try {
      const periodDays = parseInt(req.query.periodDays) || 30;
      const stats = await networkBusinessService.getStats(req.params.userId, periodDays);
      ok(res, stats);
    } catch (error) {
      fail(res, 500, error);
    }
  },

  getLegs: async (req, res) => {
    try {
      const legs = await networkBusinessService.getLegs(req.params.userId, req.query.type);
      ok(res, legs);
    } catch (error) {
      fail(res, 500, error);
    }
  },
};

module.exports = networkBusinessController;