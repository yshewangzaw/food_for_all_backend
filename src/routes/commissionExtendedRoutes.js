const express = require("express");
const router = express.Router();
const c = require("../controllers/commissionExtendedController");
const requireAuth = require("../middleware/requireAuth");

// --- Static/collection paths BEFORE /:id routes ---
router.get("/commissions/pending/summary", c.getPendingSummary);
router.get("/me/commissions/summary", requireAuth, c.getMySummary);
router.get("/me/commissions/by-source", requireAuth, c.getMyBySource);
router.get("/me/commissions/timeline", requireAuth, c.getMyTimeline);

// --- Admin batch operations ---
router.post("/admin/commissions/batch-credit", requireAuth, c.batchCredit);
router.post("/admin/commissions/recalculate", requireAuth, c.recalculate);

// --- Order-scoped commission operations ---
router.post("/orders/:id/commissions/process", c.processOrder);
router.post("/orders/:id/commissions/reverse", c.reverseOrder);
router.get("/orders/:id/commissions/preview", c.previewOrder);

// --- Single commission operations ---
router.get("/commissions/:id/beneficiary", c.getBeneficiary);
router.get("/commissions/:id/source-user", c.getSourceUser);
router.get("/commissions/:id/rule", c.getRule);
router.get("/commissions/:id/order", c.getOrder);
router.get("/commissions/:id/wallet-transaction", c.getWalletTransaction);
router.post("/commissions/:id/credit", c.creditCommission);
router.post("/commissions/:id/reverse", c.reverseSingle);
router.post("/commissions/:id/forfeit", c.forfeit);

module.exports = router;
