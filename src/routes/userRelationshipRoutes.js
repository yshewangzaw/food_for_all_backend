const express = require("express");
const router = express.Router();
const c = require("../controllers/userRelationshipController");

// User relationship routes
router.get("/users/:id/sponsor", c.getSponsor);
router.get("/users/:id/direct-referrals", c.getDirectReferrals);
router.get("/users/:id/downline", c.getDownline);
router.get("/users/:id/upline", c.getUpline);
router.get("/users/:id/kyc-documents", c.getKycDocuments);
router.get("/users/:id/orders", c.getOrders);
router.get("/users/:id/payments", c.getPayments);
router.get("/users/:id/commissions/earned", c.getCommissionsEarned);
router.get("/users/:id/commissions/generated", c.getCommissionsGenerated);
router.get("/users/:id/wallet-transactions", c.getWalletTransactions);
router.get("/users/:id/withdrawals", c.getWithdrawals);
router.get("/users/:id/notifications", c.getNotifications);

// KycDocument relationship routes
router.get("/kyc-documents/:id/user", c.getKycDocumentOwner);
router.get("/kyc-documents/:id/reviewer", c.getKycDocumentReviewer);

module.exports = router;