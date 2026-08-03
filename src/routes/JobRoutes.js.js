const express = require("express");
const router = express.Router();
const c = require("../controllers/jobController");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/roleMiddleware");

const admin = [requireAuth, requireRole("ADMIN")];

// Every job accepts ?dryRun=true and returns what it *would* change.
// Use it before every first real run.

// ---- static paths first ----
router.get("/jobs", admin, c.list);
router.get("/jobs/history", admin, c.history);

// ---- triggers ----
router.post("/jobs/qualification-run", admin, c.qualificationRun);
router.post("/jobs/qualification-backfill", admin, c.qualificationBackfill);
router.post("/jobs/qualification-reminder", admin, c.qualificationReminder);
router.post("/jobs/deactivate-lapsed", admin, c.deactivateLapsed);
router.post("/jobs/commission-batch-credit", admin, c.commissionBatchCredit);
router.post("/jobs/network-rebuild", admin, c.networkRebuild);
router.post("/jobs/network-rebuild/:userId", admin, c.networkRebuild);
router.post("/jobs/wallet-reconcile", admin, c.walletReconcile);
router.post("/jobs/payment-expiry", admin, c.paymentExpiry);
router.post("/jobs/notification-email-retry", admin, c.notificationEmailRetry);

// ---- run tracking (:runId last, so it can't shadow the triggers) ----
router.get("/jobs/:runId/status", admin, c.status);
router.post("/jobs/:runId/cancel", admin, c.cancel);

module.exports = router;