const notificationExtendedRepository = require("../repositories/notificationExtendedRepository");

const notificationExtendedService = {
  getUser: (id) => notificationExtendedRepository.getUser(id),

  getFeed: (userId, query) =>
    notificationExtendedRepository.getFeed(userId, query),
  getUnreadCount: (userId) =>
    notificationExtendedRepository.getUnreadCount(userId),
  markRead: (id, userId) => notificationExtendedRepository.markRead(id, userId),
  markAllRead: (userId, category) =>
    notificationExtendedRepository.markAllRead(userId, category),
  dismiss: (id, userId) => notificationExtendedRepository.dismiss(id, userId),

  sendToUser: (data) => notificationExtendedRepository.sendToUser(data),
  broadcast: (data) => notificationExtendedRepository.broadcast(data),
  resendEmail: (id) => notificationExtendedRepository.resendEmail(id),
  getDeliveryStats: (query) =>
    notificationExtendedRepository.getDeliveryStats(query),

  findFiltered: (query) => notificationExtendedRepository.findFiltered(query),
};

module.exports = notificationExtendedService;