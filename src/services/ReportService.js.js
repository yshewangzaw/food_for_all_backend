const reportRepository = require("../repositories/reportRepository");
const qualificationRepository = require("../repositories/qualificationRepository");

const reportService = {
  // 8.1
  getDashboard: () => reportRepository.getDashboard(),
  getDashboardTrends: (days) => reportRepository.getDashboardTrends(days),

  // 8.2
  getSales: (q) => reportRepository.getSales(q),
  getSalesByProduct: (q) => reportRepository.getSalesByProduct(q),
  getSalesByPackage: (q) => reportRepository.getSalesByPackage(q),
  getSalesByOrderType: (q) => reportRepository.getSalesByOrderType(q),
  getSalesByRegion: (q) => reportRepository.getSalesByRegion(q),
  getSalesByPaymentMethod: (q) => reportRepository.getSalesByPaymentMethod(q),

  // 8.3
  getCommissionSummary: (q) => reportRepository.getCommissionSummary(q),
  getCommissionByLevel: (q) => reportRepository.getCommissionByLevel(q),
  getCommissionByType: (q) => reportRepository.getCommissionByType(q),
  getTopEarners: (q) => reportRepository.getTopEarners(q),
  getMargin: (q) => reportRepository.getMargin(q),
  getForfeited: (q) => reportRepository.getForfeited(q),

  // 8.4
  getNetworkGrowth: (q) => reportRepository.getNetworkGrowth(q),
  getDepthDistribution: () => reportRepository.getDepthDistribution(),
  getActiveRatio: () => reportRepository.getActiveRatio(),
  getQualificationReport: (period, q) =>
    qualificationRepository.getPeriodReport(period, q),
  getQualificationSummary: (period) =>
    qualificationRepository.getSummary(period),
  getInactiveMembers: (months) => reportRepository.getInactiveMembers(months),
  getChurn: (q) => reportRepository.getChurn(q),
  getNewMembers: (q) => reportRepository.getNewMembers(q),
  getRecruiterLeaderboard: (q) => reportRepository.getRecruiterLeaderboard(q),

  // 8.5
  getWithdrawalSummary: (q) => reportRepository.getWithdrawalSummary(q),
  getWithdrawalAging: () => reportRepository.getWithdrawalAging(),
  getPaymentReconciliation: (q) => reportRepository.getPaymentReconciliation(q),
  getPaymentRejectionReasons: (q) =>
    reportRepository.getPaymentRejectionReasons(q),
  getKycSummary: () => reportRepository.getKycSummary(),

  // 8.6
  getMemberDashboard: (userId) => reportRepository.getMemberDashboard(userId),
  getMemberEarnings: (userId, q) =>
    reportRepository.getMemberEarnings(userId, q),
  getMemberEarningsByLevel: (userId, q) =>
    reportRepository.getMemberEarningsByLevel(userId, q),
  getMemberNetworkGrowth: (userId, q) =>
    reportRepository.getMemberNetworkGrowth(userId, q),
  getTeamPerformance: (userId, period) =>
    reportRepository.getTeamPerformance(userId, period),
  getMemberPurchases: (userId, q) =>
    reportRepository.getMemberPurchases(userId, q),
};

module.exports = reportService;