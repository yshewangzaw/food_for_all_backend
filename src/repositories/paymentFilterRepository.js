const paymentRepository = require("./paymentRepository");

const paymentFilterRepository = {
  findFiltered: async (query) => ({ rows: [], total: 0 }),
};

module.exports = paymentFilterRepository;
