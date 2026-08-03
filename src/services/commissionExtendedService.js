const commissionRelationshipRepository = require("../repositories/commissionRelationshipRepository");
const commissionBusinessRepository = require("../repositories/commissionBusinessRepository");
const commissionFilterRepository = require("../repositories/commissionFilterRepository");
const engine = require("../repositories/commissionEngine");

const commissionExtendedService = {
  getBeneficiary: (id) => commissionRelationshipRepository.getBeneficiary(id),
  getSourceUser: (id) => commissionRelationshipRepository.getSourceUser(id),
  getRule: (id) => commissionRelationshipRepository.getRule(id),
  getOrder: (id) => commissionRelationshipRepository.getOrder(id),
  getWalletTransaction: (id) =>
    commissionRelationshipRepository.getWalletTransaction(id),

  processOrder: (orderId) => commissionBusinessRepository.processOrder(orderId),
  previewOrder: (orderId) => commissionBusinessRepository.previewOrder(orderId),
  reverseOrder: (orderId, reason) =>
    commissionBusinessRepository.reverseOrder(orderId, reason),
  creditCommission: (id) => commissionBusinessRepository.creditCommission(id),
  reverseSingle: (id, reason) =>
    commissionBusinessRepository.reverseSingle(id, reason),
  forfeit: (id, reason) => commissionBusinessRepository.forfeit(id, reason),
  batchCredit: (ids) => commissionBusinessRepository.batchCredit(ids),
  recalculate: (start, end) =>
    commissionBusinessRepository.recalculate(start, end),
  getPendingSummary: () => commissionBusinessRepository.getPendingSummary(),
  getMySummary: (userId, period) =>
    commissionBusinessRepository.getMySummary(userId, period),
  getMyBySource: (userId) => commissionBusinessRepository.getMyBySource(userId),
  getMyTimeline: (userId, groupBy) =>
    commissionBusinessRepository.getMyTimeline(userId, groupBy),

  simulate: async (buyerUserId, orderAmount, orderPv) => {
    const fakeOrder = {
      buyerUserId,
      totalAmount: orderAmount,
      totalPv: orderPv,
      createdAt: new Date(),
    };
    return await engine.calculate(fakeOrder);
  },

  findFiltered: (query) => commissionFilterRepository.findFiltered(query),
};

module.exports = commissionExtendedService;
