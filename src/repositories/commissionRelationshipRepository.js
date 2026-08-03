const commissionRepository = require("./commissionRepository");

const commissionRelationshipRepository = {
  getMembers: async (commissionId) => [],
  getRules: async (commissionId) => [],
  getPayouts: async (commissionId) => [],
  getSummary: async (commissionId) => ({ commissionId, total: 0 }),
};

module.exports = commissionRelationshipRepository;
