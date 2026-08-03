const commissionRepository = require("./commissionRepository");

const commissionBusinessRepository = {
  setActive: async (commissionId, active) => ({ commissionId, active }),
  setImage: async (commissionId, imageUrl) => ({ commissionId, imageUrl }),
  getCategories: async () => [],
  getSalesStats: async (commissionId, from, to) => ({ commissionId, from, to, totalSales: 0 }),
  bulkImport: async (rows, dryRun) => ({ created: 0, dryRun, rows: rows.length }),
  getOverview: async () => ({ total: 0 }),
};

module.exports = commissionBusinessRepository;
