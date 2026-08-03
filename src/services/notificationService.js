const notificationRepository = require("../repositories/notificationRepository");

const notificationService = {
  getAll: async () => {
    return await notificationRepository.findAll();
  },

  getByUserId: async (userId) => {
    return await notificationRepository.findByUserId(userId);
  },

  getById: async (id) => {
    const notification = await notificationRepository.findById(id);
    if (!notification) throw new Error("Notification not found");
    return notification;
  },

  create: async (data) => {
    return await notificationRepository.create(data);
  },

  update: async (id, data) => {
    const notification = await notificationRepository.update(id, data);
    if (!notification) throw new Error("Notification not found");
    return notification;
  },

  delete: async (id) => {
    const notification = await notificationRepository.delete(id);
    if (!notification) throw new Error("Notification not found");
    return notification;
  },
};

module.exports = notificationService;