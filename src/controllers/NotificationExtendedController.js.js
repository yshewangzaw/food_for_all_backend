const notificationExtendedService = require("../services/notificationExtendedService");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, error) =>
  res.status(status).json({ success: false, message: error.message });

const notificationExtendedController = {
  getUser: async (req, res) => {
    try {
      ok(res, await notificationExtendedService.getUser(req.params.id));
    } catch (error) {
      fail(res, 404, error);
    }
  },

  // GET /api/me/notifications
  getFeed: async (req, res) => {
    try {
      const result = await notificationExtendedService.getFeed(
        req.user.id,
        req.query,
      );
      res.json({ success: true, ...result });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  // GET /api/me/notifications/unread-count
  getUnreadCount: async (req, res) => {
    try {
      ok(res, await notificationExtendedService.getUnreadCount(req.user.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  // POST /api/me/notifications/:id/read
  markRead: async (req, res) => {
    try {
      ok(
        res,
        await notificationExtendedService.markRead(req.params.id, req.user.id),
      );
    } catch (error) {
      fail(res, 400, error);
    }
  },

  // POST /api/me/notifications/read-all
  markAllRead: async (req, res) => {
    try {
      ok(
        res,
        await notificationExtendedService.markAllRead(
          req.user.id,
          req.query.category,
        ),
      );
    } catch (error) {
      fail(res, 400, error);
    }
  },

  // DELETE /api/me/notifications/:id
  dismiss: async (req, res) => {
    try {
      ok(
        res,
        await notificationExtendedService.dismiss(req.params.id, req.user.id),
      );
    } catch (error) {
      fail(res, 400, error);
    }
  },

  // POST /api/admin/notifications/send
  sendToUser: async (req, res) => {
    try {
      const n = await notificationExtendedService.sendToUser(req.body);
      res.status(201).json({ success: true, data: n });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  // POST /api/admin/notifications/broadcast
  broadcast: async (req, res) => {
    try {
      const result = await notificationExtendedService.broadcast(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      fail(res, 400, error);
    }
  },

  // POST /api/admin/notifications/:id/resend-email
  resendEmail: async (req, res) => {
    try {
      ok(res, await notificationExtendedService.resendEmail(req.params.id));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  // GET /api/admin/notifications/delivery-stats
  getDeliveryStats: async (req, res) => {
    try {
      ok(res, await notificationExtendedService.getDeliveryStats(req.query));
    } catch (error) {
      fail(res, 400, error);
    }
  },

  findFiltered: async (req, res) => {
    try {
      const result = await notificationExtendedService.findFiltered(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      fail(res, 400, error);
    }
  },
};

module.exports = notificationExtendedController;