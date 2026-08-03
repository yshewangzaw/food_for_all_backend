const orderRelationshipRepository = require("../repositories/orderRelationshipRepository");
const orderBusinessRepository = require("../repositories/orderBusinessRepository");
const orderFilterRepository = require("../repositories/orderFilterRepository");

const orderExtendedService = {
  getItems: (id) => orderRelationshipRepository.getItems(id),
  getPayments: (id) => orderRelationshipRepository.getPayments(id),
  getCommissions: (id) => orderRelationshipRepository.getCommissions(id),
  getBuyer: (id) => orderRelationshipRepository.getBuyer(id),
  getOrderItemProduct: (id) =>
    orderRelationshipRepository.getOrderItemProduct(id),
  getOrderItemPackage: (id) =>
    orderRelationshipRepository.getOrderItemPackage(id),

  quote: (items) => orderBusinessRepository.quote(items),
  checkout: (buyerUserId, orderType, items, note) =>
    orderBusinessRepository.checkout(buyerUserId, orderType, items, note),
  cancel: (orderId) => orderBusinessRepository.cancel(orderId),
  refund: (orderId, reason) => orderBusinessRepository.refund(orderId, reason),
  getInvoiceData: (orderId) => orderBusinessRepository.getInvoiceData(orderId),
  getCurrentMonthOrder: (userId) =>
    orderBusinessRepository.getCurrentMonthOrder(userId),
  getNextOrderNumber: () => orderBusinessRepository.getNextOrderNumber(),
  recalculatePv: (orderId) => orderBusinessRepository.recalculatePv(orderId),

  findFiltered: (query) => orderFilterRepository.findFiltered(query),
};

module.exports = orderExtendedService;
