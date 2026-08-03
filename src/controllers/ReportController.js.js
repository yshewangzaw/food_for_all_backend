const reportService = require("../services/reportService");
const { sendCsv, sendXlsx } = require("../utils/export");

/**
 * Every report accepts ?format=json|csv|xlsx. Rather than repeating that
 * branch 25 times, `report()` wraps a service call: it runs the report,
 * then either returns JSON or streams a file.
 *
 * Exports need a flat array. When a report returns an object with a nested
 * array (e.g. { totalForfeited, breakdown: [...] }), pass `pick` to say
 * which key holds the rows.
 */
const report = (fn, { filename, pick } = {}) => async (req, res) => {
  try {
    const data = await fn(req);
    const format = req.query.format || "json";

    if (format === "csv" || format === "xlsx") {
      const rows = pick ? data[pick] : data;
      if (!Array.isArray(rows)) {
        return res.status(400).json({
          success: false,
          message: "This report cannot be exported as a file",
        });
      }
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No data for this period" });
      }

      const fields = Object.keys(rows[0]);
      const name = `${filename || "report"}-${new Date().toISOString().slice(0, 10)}`;
      return format === "csv"
        ? sendCsv(res, rows, name, fields)
        : sendXlsx(res, rows, name, fields);
    }

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const reportController = {
  // ---- 8.1 overview ----
  dashboard: report((req) => reportService.getDashboard()),
  dashboardTrends: report((req) =>
    reportService.getDashboardTrends(req.query.days),
  ),

  // ---- 8.2 sales ----
  sales: report((req) => reportService.getSales(req.query), {
    filename: "sales",
  }),
  salesByProduct: report((req) => reportService.getSalesByProduct(req.query), {
    filename: "sales-by-product",
  }),
  salesByPackage: report((req) => reportService.getSalesByPackage(req.query), {
    filename: "sales-by-package",
  }),
  salesByOrderType: report((req) =>
    reportService.getSalesByOrderType(req.query),
  ),
  salesByRegion: report((req) => reportService.getSalesByRegion(req.query), {
    filename: "sales-by-region",
  }),
  salesByPaymentMethod: report((req) =>
    reportService.getSalesByPaymentMethod(req.query),
  ),

  // ---- 8.3 commissions ----
  commissionSummary: report((req) =>
    reportService.getCommissionSummary(req.query),
  ),
  commissionByLevel: report((req) =>
    reportService.getCommissionByLevel(req.query),
  ),
  commissionByType: report((req) =>
    reportService.getCommissionByType(req.query),
  ),
  topEarners: report((req) => reportService.getTopEarners(req.query), {
    filename: "top-earners",
  }),
  margin: report((req) => reportService.getMargin(req.query), {
    filename: "commission-margin",
  }),
  forfeited: report((req) => reportService.getForfeited(req.query), {
    filename: "forfeited-commissions",
    pick: "breakdown",
  }),

  // ---- 8.4 network & members ----
  networkGrowth: report((req) => reportService.getNetworkGrowth(req.query), {
    filename: "network-growth",
  }),
  depthDistribution: report((req) => reportService.getDepthDistribution()),
  activeRatio: report((req) => reportService.getActiveRatio()),
  qualification: report(
    (req) =>
      reportService.getQualificationReport(
        req.query.month || req.query.period,
        req.query,
      ),
    { filename: "qualification", pick: "data" },
  ),
  qualificationSummary: report((req) =>
    reportService.getQualificationSummary(req.query.month || req.query.period),
  ),
  inactiveMembers: report(
    (req) => reportService.getInactiveMembers(req.query.months || 2),
    { filename: "inactive-members" },
  ),
  churn: report((req) => reportService.getChurn(req.query), {
    filename: "churn",
  }),
  newMembers: report((req) => reportService.getNewMembers(req.query), {
    filename: "new-members",
  }),
  recruiterLeaderboard: report(
    (req) => reportService.getRecruiterLeaderboard(req.query),
    { filename: "top-recruiters" },
  ),

  // ---- 8.5 money & compliance ----
  withdrawalSummary: report((req) =>
    reportService.getWithdrawalSummary(req.query),
  ),
  withdrawalAging: report((req) => reportService.getWithdrawalAging()),
  paymentReconciliation: report(
    (req) => reportService.getPaymentReconciliation(req.query),
    { filename: "payment-reconciliation" },
  ),
  paymentRejectionReasons: report((req) =>
    reportService.getPaymentRejectionReasons(req.query),
  ),
  kycSummary: report((req) => reportService.getKycSummary()),

  // ---- 8.6 member-facing ----
  myDashboard: report((req) => reportService.getMemberDashboard(req.user.id)),
  myEarnings: report(
    (req) => reportService.getMemberEarnings(req.user.id, req.query),
    { filename: "my-earnings" },
  ),
  myEarningsByLevel: report((req) =>
    reportService.getMemberEarningsByLevel(req.user.id, req.query),
  ),
  myNetworkGrowth: report((req) =>
    reportService.getMemberNetworkGrowth(req.user.id, req.query),
  ),
  myTeamPerformance: report(
    (req) => reportService.getTeamPerformance(req.user.id, req.query.period),
    { filename: "my-team", pick: "members" },
  ),
  myPurchases: report(
    (req) => reportService.getMemberPurchases(req.user.id, req.query),
    { filename: "my-purchases", pick: "orders" },
  ),
};

module.exports = reportController;