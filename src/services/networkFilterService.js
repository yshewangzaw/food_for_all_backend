const networkFilterRepository = require("../repositories/networkFilterRepository");

const networkFilterService = {
  findNetworkPaths: async (query) => {
    return await networkFilterRepository.findNetworkPaths(query);
  },

  findDescendantsFiltered: async (userId, query) => {
    return await networkFilterRepository.findDescendantsFiltered(userId, query);
  },
};

module.exports = networkFilterService;