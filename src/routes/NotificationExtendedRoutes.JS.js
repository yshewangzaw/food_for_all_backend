const express = require("express");
const router = express.Router();
const c = require("../controllers/notificationExtendedController");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/roleMiddleware");

// ---- member feed ----
// read-all and unread-count are static and must come before /:id
router.get("/me/notifications", requireAuth, c.getFeed);
router.get("/me/notifications/unread-count", requireAuth, c.getUnreadCount);
router.post("/me/notifications/read-all", requireAuth, c.markAllRead);
router.post("/me/notifications/:id/read", requireAuth, c.markRead);
router.delete("/me/notifications/:id", requireAuth, c.dismiss);

// ---- admin ----
router.post(
  "/admin/notifications/send",
  requireAuth,
  requireRole("ADMIN"),
  c.sendToUser,
);
router.post(
  "/admin/notifications/broadcast",
  requireAuth,
  requireRole("ADMIN"),
  c.broadcast,
);
router.get(
  "/admin/notifications/delivery-stats",
  requireAuth,
  requireRole("ADMIN"),
  c.getDeliveryStats,
);
router.post(
  "/admin/notifications/:id/resend-email",
  requireAuth,
  requireRole("ADMIN"),
  c.resendEmail,
);

// ---- relationships + filter ----
router.get("/notifications/search", requireAuth, requireRole("ADMIN"), c.findFiltered);
router.get("/notifications/:id/user", requireAuth, c.getUser);

module.exports = router;