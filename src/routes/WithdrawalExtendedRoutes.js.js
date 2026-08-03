const express = require("express");
const router = express.Router();
const c = require("../controllers/withdrawalExtendedController");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/roleMiddleware");
const { imageUpload } = require("../middleware/uploadMiddleware");

// ---- member ----
router.get("/me/withdrawals/eligibility", requireAuth, c.getEligibility);
router.post("/withdrawals", requireAuth, c.create);
router.post("/withdrawals/:id/cancel", requireAuth, c.cancel);

// ---- admin queues (static paths BEFORE /withdrawals/:id) ----
router.get(
  "/withdrawals/queue",
  requireAuth,
  requireRole("ADMIN"),
  c.getQueue,
);
router.get(
  "/withdrawals/payout-batch",
  requireAuth,
  requireRole("ADMIN"),
  c.getPayoutBatch,
);
router.get(
  "/withdrawals/search",
  requireAuth,
  requireRole("ADMIN"),
  c.findFiltered,
);
router.post(
  "/withdrawals/bulk-mark-paid",
  requireAuth,
  requireRole("ADMIN"),
  c.bulkMarkPaid,
);

// ---- relationships ----
router.get("/withdrawals/:id/user", requireAuth, c.getUser);
router.get("/withdrawals/:id/payment-method", requireAuth, c.getPaymentMethod);
router.get(
  "/withdrawals/:id/wallet-transactions",
  requireAuth,
  c.getWalletTransactions,
);

// ---- admin decisions ----
router.post(
  "/withdrawals/:id/review",
  requireAuth,
  requireRole("ADMIN"),
  c.review,
);
router.post(
  "/withdrawals/:id/approve",
  requireAuth,
  requireRole("ADMIN"),
  c.approve,
);
router.post(
  "/withdrawals/:id/reject",
  requireAuth,
  requireRole("ADMIN"),
  c.reject,
);
router.post(
  "/withdrawals/:id/mark-paid",
  requireAuth,
  requireRole("ADMIN"),
  imageUpload.single("proof"),
  c.markPaid,
);

module.exports = router;