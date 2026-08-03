const express = require("express");
const router = express.Router();
const c = require("../controllers/reportController");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/roleMiddleware");

const admin = [requireAuth, requireRole("ADMIN")];

// ==================== 8.6 member-facing ====================
// Registered first: /me/* can never collide with an admin :id route.
router.get("/me/dashboard", requireAuth, c.myDashboard);
router.get("/me/reports/earnings", requireAuth, c.myEarnings);
router.get("/me/reports/earnings/by-level", requireAuth, c.myEarningsByLevel);
router.get("/me/reports/network-growth", requireAuth, c.myNetworkGrowth);
router.get("/me/reports/team-performance", requireAuth, c.myTeamPerformance);
router.get("/me/reports/purchases", requireAuth, c.myPurchases);

// ==================== 8.1 overview ====================
router.get("/reports/dashboard", admin, c.dashboard);
router.get("/reports/dashboard/trends", admin, c.dashboardTrends);

// ==================== 8.2 sales ====================
// More specific paths first — /reports/sales/by-product must not be
// swallowed by /reports/sales.
router.get("/reports/sales/by-product", admin, c.salesByProduct);
router.get("/reports/sales/by-package", admin, c.salesByPackage);
router.get("/reports/sales/by-order-type", admin, c.salesByOrderType);
router.get("/reports/sales/by-region", admin, c.salesByRegion);
router.get("/reports/sales/by-payment-method", admin, c.salesByPaymentMethod);
router.get("/reports/sales", admin, c.sales);

// ==================== 8.3 commissions ====================
router.get("/reports/commissions/summary", admin, c.commissionSummary);
router.get("/reports/commissions/by-level", admin, c.commissionByLevel);
router.get("/reports/commissions/by-type", admin, c.commissionByType);
router.get("/reports/commissions/top-earners", admin, c.topEarners);
router.get("/reports/commissions/margin", admin, c.margin);
router.get("/reports/commissions/forfeited", admin, c.forfeited);

// ==================== 8.4 network & members ====================
router.get("/reports/network/growth", admin, c.networkGrowth);
router.get("/reports/network/depth-distribution", admin, c.depthDistribution);
router.get("/reports/network/active-ratio", admin, c.activeRatio);
router.get("/reports/members/qualification", admin, c.qualification);
router.get(
  "/reports/members/qualification/summary",
  admin,
  c.qualificationSummary,
);
router.get("/reports/members/inactive", admin, c.inactiveMembers);
router.get("/reports/members/churn", admin, c.churn);
router.get("/reports/members/new", admin, c.newMembers);
router.get("/reports/leaderboard/recruiters", admin, c.recruiterLeaderboard);
router.get("/reports/leaderboard/earners", admin, c.topEarners);

// ==================== 8.5 money & compliance ====================
router.get("/reports/wallet/liability", admin, async (req, res) => {
  // delegates to the wallet repository so there is one definition of liability
  const walletService = require("../services/walletExtendedService");
  try {
    res.json({ success: true, data: await walletService.getLiability() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/reports/withdrawals/summary", admin, c.withdrawalSummary);
router.get("/reports/withdrawals/aging", admin, c.withdrawalAging);
router.get("/reports/payments/reconciliation", admin, c.paymentReconciliation);
router.get(
  "/reports/payments/rejection-reasons",
  admin,
  c.paymentRejectionReasons,
);
router.get("/reports/kyc/summary", admin, c.kycSummary);

module.exports = router;