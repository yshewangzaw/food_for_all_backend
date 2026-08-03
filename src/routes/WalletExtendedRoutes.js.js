const express = require("express");
const router = express.Router();
const c = require("../controllers/walletExtendedController");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/roleMiddleware");

// ---- member (self) ----
router.get("/me/wallet", requireAuth, c.getMyBalance);
router.get("/me/wallet/transactions", requireAuth, c.getMyTransactions);
router.get("/me/wallet/statement", requireAuth, c.getMyStatement);

// ---- admin oversight ----
// These must come BEFORE /wallet-transactions/:id or Express will read
// "reconcile" as an :id value.
router.get(
  "/admin/wallet/reconcile",
  requireAuth,
  requireRole("ADMIN"),
  c.reconcile,
);
router.get(
  "/admin/wallet/liability",
  requireAuth,
  requireRole("ADMIN"),
  c.getLiability,
);
router.post(
  "/admin/wallet/adjustments",
  requireAuth,
  requireRole("ADMIN"),
  c.adjust,
);
router.post(
  "/admin/wallet/reversal",
  requireAuth,
  requireRole("ADMIN"),
  c.reverse,
);

// ---- admin viewing a member ----
router.get(
  "/users/:id/wallet",
  requireAuth,
  requireRole("ADMIN"),
  c.getUserBalance,
);
router.get(
  "/users/:id/wallet/transactions",
  requireAuth,
  requireRole("ADMIN"),
  c.getUserTransactions,
);
router.get(
  "/users/:id/wallet/statement",
  requireAuth,
  requireRole("ADMIN"),
  c.getUserStatement,
);

// ---- ledger row relationships ----
router.get("/wallet-transactions/:id/reference", requireAuth, c.getReference);
router.get("/wallet-transactions/:id/created-by", requireAuth, c.getCreatedBy);

// ---- filtered list (spec 6.1) ----
router.get(
  "/wallet-transactions/search",
  requireAuth,
  requireRole("ADMIN"),
  c.findFiltered,
);

module.exports = router;