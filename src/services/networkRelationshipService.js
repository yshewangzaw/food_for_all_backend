const networkRelationshipRepository = require("../repositories/networkRelationshipRepository");

const networkRelationshipService = {
  getAncestors: async (userId) => {
    return await networkRelationshipRepository.getAncestors(userId);
  },

  getDescendants: async (userId, maxLevel) => {
    return await networkRelationshipRepository.getDescendants(userId, maxLevel);
  },

  getAtLevel: async (userId, level) => {
    return await networkRelationshipRepository.getAtLevel(userId, level);
  },

  getRelationship: async (userId, otherId) => {
    return await networkRelationshipRepository.getRelationship(userId, otherId);
  },
};

module.exports = networkRelationshipService;