const paymentExtendedRepository = require("../repositories/paymentExtendedRepository");
const paymentFilterRepository = require("../repositories/paymentFilterRepository");

const paymentExtendedService = {
  getOrder: (id) => paymentExtendedRepository.getOrder(id),
  getMethod: (id) => paymentExtendedRepository.getMethod(id),
  getUser: (id) => paymentExtendedRepository.getUser(id),
  getReviewer: (id) => paymentExtendedRepository.getReviewer(id),

  create: (data) => paymentExtendedRepository.create(data),
  approve: (id, reviewerId) =>
    paymentExtendedRepository.approve(id, reviewerId),
  reject: (id, reviewerId, reason) =>
    paymentExtendedRepository.reject(id, reviewerId, reason),
  cancel: (id, userId) => paymentExtendedRepository.cancel(id, userId),
  resubmitProof: (id, proofImageUrl) =>
    paymentExtendedRepository.resubmitProof(id, proofImageUrl),
  getQueue: () => paymentExtendedRepository.getQueue(),
  checkReference: (referenceNo) =>
    paymentExtendedRepository.checkReference(referenceNo),
  bulkApprove: (ids, reviewerId) =>
    paymentExtendedRepository.bulkApprove(ids, reviewerId),

  findFiltered: (query) => paymentFilterRepository.findFiltered(query),
};

module.exports = paymentExtendedService;
