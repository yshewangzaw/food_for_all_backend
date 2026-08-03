const commissionRepository = require("./commissionRepository");

const commissionFilterRepository = {
  findFiltered: async (query) => ({ rows: [], total: 0 }),
};

module.exports = commissionFilterRepository;
