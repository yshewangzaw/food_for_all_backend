import userService from "./userService";
import orderService from "./orderService";
import commissionService from "./commissionService";
import withdrawalRequestService from "./withdrawalRequestService";
import paymentService from "./paymentService";
import productService from "./productService";
import packageService from "./packageService";
import walletTransactionService from "./walletTransactionService";
import kycService from "./kycService";
import { sumBy, countBy, sortByDateDesc } from "../utils/helpers";

/**
 * TODO(backend): there is no /api/dashboard or /api/stats endpoint.
 * Everything below is computed in the browser from the real list endpoints —
 * no numbers are invented. Once a stats endpoint exists, replace getOverview()
 * with a single GET and delete the aggregation helpers.
 */

/** Runs every request in parallel; one failing module never blanks the page. */
const loadAll = async () => {
  const calls = [
    ["users", userService.getAll],
    ["orders", orderService.getAll],
    ["commissions", commissionService.getAll],
    ["withdrawals", withdrawalRequestService.getAll],
    ["payments", paymentService.getAll],
    ["products", productService.getAll],
    ["packages", packageService.getAll],
    ["walletTransactions", walletTransactionService.getAll],
    ["kycDocuments", kycService.getAll],
  ];

  const settled = await Promise.allSettled(
    calls.map(([, fetcher]) => fetcher(undefined, { skipErrorToast: true }))
  );

  const result = {};
  const failed = [];

  settled.forEach((outcome, index) => {
    const [name] = calls[index];
    if (outcome.status === "fulfilled" && Array.isArray(outcome.value)) {
      result[name] = outcome.value;
    } else {
      result[name] = [];
      failed.push(name);
    }
  });

  result.failedModules = failed;
  return result;
};

const dashboardService = {
  getOverview: async () => {
    const data = await loadAll();

    const usersByStatus = countBy(data.users, "status");
    const ordersByStatus = countBy(data.orders, "status");
    const commissionsByStatus = countBy(data.commissions, "status");
    const withdrawalsByStatus = countBy(data.withdrawals, "status");
    const paymentsByStatus = countBy(data.payments, "status");
    const kycByStatus = countBy(data.kycDocuments, "status");

    const paidOrders = (data.orders || []).filter((order) => order.status === "PAID");

    return {
      failedModules: data.failedModules,

      // Headline numbers
      stats: {
        totalMembers: data.users.length,
        activeMembers: usersByStatus.ACTIVE || 0,
        pendingMembers: usersByStatus.PENDING || 0,

        totalOrders: data.orders.length,
        paidOrders: paidOrders.length,
        pendingOrders: ordersByStatus.PENDING_PAYMENT || 0,
        grossRevenue: sumBy(paidOrders, "totalAmount"),
        totalPv: sumBy(paidOrders, "totalPv"),

        totalCommission: sumBy(data.commissions, "commissionAmount"),
        creditedCommission: sumBy(
          (data.commissions || []).filter((row) => row.status === "CREDITED"),
          "commissionAmount"
        ),
        pendingCommissionCount: commissionsByStatus.PENDING || 0,

        walletBalance: sumBy(data.users, "wallet"),

        pendingWithdrawals: withdrawalsByStatus.PENDING || 0,
        withdrawalPayout: sumBy(
          (data.withdrawals || []).filter((row) => row.status === "PAID"),
          "amount"
        ),

        paymentsAwaitingReview: paymentsByStatus.SUBMITTED || 0,
        kycAwaitingReview: kycByStatus.PENDING || 0,

        productCount: data.products.length,
        packageCount: data.packages.length,
      },

      // Chart-ready breakdowns
      breakdowns: {
        ordersByStatus,
        commissionsByStatus,
        withdrawalsByStatus,
        usersByStatus,
        paymentsByStatus,
      },

      // Latest records for the feed and preview tables
      recent: {
        users: sortByDateDesc(data.users).slice(0, 5),
        orders: sortByDateDesc(data.orders).slice(0, 5),
        commissions: sortByDateDesc(data.commissions).slice(0, 5),
        withdrawals: sortByDateDesc(data.withdrawals).slice(0, 5),
        walletTransactions: sortByDateDesc(data.walletTransactions).slice(0, 6),
      },

      // Raw lists, in case a widget needs them
      raw: data,
    };
  },
};

export default dashboardService;
