const networkBusinessRepository = require("../repositories/networkBusinessRepository");

const networkBusinessService = {
  getTree: async (userId, depth) => {
    return await networkBusinessRepository.getTree(userId, depth);
  },

  getStats: async (userId, periodDays) => {
    return await networkBusinessRepository.getStats(userId, periodDays);
  },

  getLegs: async (userId, type) => {
    return await networkBusinessRepository.getLegs(userId, type);
  },
};

module.exports = networkBusinessService;