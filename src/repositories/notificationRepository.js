const { Notification, User } = require("../models");

const notificationRepository = {
  findAll: async () => {
    return await Notification.findAll({
      include: [{ model: User, as: "user", attributes: ["id", "fullName", "email"] }],
      order: [["createdAt", "DESC"]],
    });
  },

  findByUserId: async (userId) => {
    return await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  },

  findById: async (id) => {
    return await Notification.findByPk(id, {
      include: [{ model: User, as: "user", attributes: ["id", "fullName", "email"] }],
    });
  },

  create: async (data) => {
    return await Notification.create(data);
  },

  update: async (id, data) => {
    const notification = await Notification.findByPk(id);
    if (!notification) return null;
    await notification.update(data);
    return await Notification.findByPk(id);
  },

  delete: async (id) => {
    const notification = await Notification.findByPk(id);
    if (!notification) return null;
    await notification.destroy();
    return notification;
  },
};

module.exports = notificationRepository;