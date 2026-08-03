import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/card/Card";
import StatCard from "../../components/card/StatCard";
import Button from "../../components/button/Button";
import PageLoader from "../../components/loading/PageLoader";
import EmptyState from "../../components/emptyState/EmptyState";
import StatusBadge from "../../components/statusBadge/StatusBadge";
import Table from "../../components/table/Table";
import BarChart from "../../components/chart/BarChart";
import DonutChart from "../../components/chart/DonutChart";
import useFetch from "../../hooks/useFetch";
import dashboardService from "../../services/dashboardService";
import ROUTES from "../../constants/routes";
import {
  formatMoney,
  formatNumber,
  formatDate,
  humanize,
  timeAgo,
} from "../../utils/helpers";

/**
 * The numbers here are derived in the browser from the real list endpoints —
 * see services/dashboardService.js. There is no /api/stats endpoint yet.
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, reload } = useFetch(() => dashboardService.getOverview(), []);

  if (isLoading) {
    return <PageLoader message="Pulling the latest numbers" />;
  }

  if (error || !data) {
    return (
      <>
        <PageHeader title="Dashboard" description="An overview of the whole network." />
        <Card>
          <EmptyState
            icon="!"
            title="Couldn't load the dashboard"
            message={error || "The API didn't return anything usable."}
            actionLabel="Try again"
            onAction={reload}
          />
        </Card>
      </>
    );
  }

  const { stats, breakdowns, recent, failedModules } = data;

  const orderChartData = Object.entries(breakdowns.ordersByStatus).map(([status, count]) => ({
    label: humanize(status),
    value: count,
    color:
      status === "PAID"
        ? "var(--brand)"
        : status === "PENDING_PAYMENT"
        ? "var(--amber)"
        : "var(--rose)",
  }));

  const commissionChartData = [
    {
      label: "Credited",
      value: breakdowns.commissionsByStatus.CREDITED || 0,
      color: "#0e7c6b",
    },
    {
      label: "Pending",
      value: breakdowns.commissionsByStatus.PENDING || 0,
      color: "#a86c0a",
    },
    {
      label: "Reversed",
      value: breakdowns.commissionsByStatus.REVERSED || 0,
      color: "#b93a34",
    },
  ].filter((slice) => slice.value > 0);

  const orderColumns = [
    { key: "orderNumber", label: "Order", render: (value) => <span className="u-mono">{value}</span> },
    { key: "orderType", label: "Type", render: (value) => humanize(value) },
    {
      key: "totalAmount",
      label: "Total",
      align: "right",
      render: (value) => <span className="u-mono">{formatMoney(value)}</span>,
    },
    { key: "status", label: "Status", render: (value) => <StatusBadge value={value} /> },
    { key: "createdAt", label: "Placed", render: (value) => formatDate(value) },
  ];

  const memberColumns = [
    { key: "fullName", label: "Member", render: (value) => <span className="u-bold">{value}</span> },
    { key: "email", label: "Email" },
    { key: "status", label: "Status", render: (value) => <StatusBadge value={value} /> },
    { key: "createdAt", label: "Joined", render: (value) => formatDate(value) },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Where the network stands right now, across every module."
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <Button variant="secondary" onClick={reload}>
            Refresh
          </Button>
        }
      />

      {failedModules.length > 0 && (
        <p className="notice u-mb-4">
          Some modules didn&apos;t respond: {failedModules.join(", ")}. The figures below leave
          them out. Check that the API is running and try refreshing.
        </p>
      )}

      {/* Headline numbers */}
      <div className="u-grid u-grid-4 u-mb-4">
        <StatCard
          label="Members"
          value={formatNumber(stats.totalMembers)}
          meta={`${stats.activeMembers} active · ${stats.pendingMembers} pending`}
          to={ROUTES.USERS}
        />
        <StatCard
          label="Gross revenue"
          value={formatMoney(stats.grossRevenue)}
          meta={`From ${stats.paidOrders} paid orders`}
          tone="blue"
          to={ROUTES.ORDERS}
        />
        <StatCard
          label="Commission earned"
          value={formatMoney(stats.totalCommission)}
          meta={`${formatMoney(stats.creditedCommission)} credited`}
          tone="violet"
          to={ROUTES.COMMISSIONS}
        />
        <StatCard
          label="Wallet liability"
          value={formatMoney(stats.walletBalance)}
          meta="Total held across all member wallets"
          tone="amber"
          to={ROUTES.WALLET_TRANSACTIONS}
        />
      </div>

      {/* Things waiting on a human */}
      <div className="u-grid u-grid-4 u-mb-4">
        <StatCard
          label="Payments to review"
          value={formatNumber(stats.paymentsAwaitingReview)}
          meta="Submitted, not yet approved"
          tone="amber"
          to={ROUTES.PAYMENTS}
        />
        <StatCard
          label="Withdrawals pending"
          value={formatNumber(stats.pendingWithdrawals)}
          meta={`${formatMoney(stats.withdrawalPayout)} paid out so far`}
          tone="rose"
          to={ROUTES.WITHDRAWAL_REQUESTS}
        />
        <StatCard
          label="KYC to review"
          value={formatNumber(stats.kycAwaitingReview)}
          meta="Documents awaiting a decision"
          tone="blue"
          to={ROUTES.KYC}
        />
        <StatCard
          label="Orders unpaid"
          value={formatNumber(stats.pendingOrders)}
          meta={`${stats.totalOrders} orders in total`}
          tone="amber"
          to={ROUTES.ORDERS}
        />
      </div>

      {/* Charts */}
      <div className="u-grid u-grid-2 u-mb-4">
        <Card title="Orders by status" subtitle="Every order currently in the system">
          <BarChart data={orderChartData} />
        </Card>

        <Card title="Commissions by status" subtitle="How earnings are settling">
          <DonutChart data={commissionChartData} />
        </Card>
      </div>

      {/* Quick actions + activity */}
      <div className="u-grid u-grid-2 u-mb-4">
        <Card title="Quick actions" subtitle="Jump straight to the work">
          <div className="quick-actions">
            <button
              type="button"
              className="quick-action"
              onClick={() => navigate(ROUTES.PAYMENTS)}
            >
              <span className="activity__mark">⊡</span>
              Review submitted payments
            </button>
            <button
              type="button"
              className="quick-action"
              onClick={() => navigate(ROUTES.WITHDRAWAL_REQUESTS)}
            >
              <span className="activity__mark">↧</span>
              Process withdrawal requests
            </button>
            <button type="button" className="quick-action" onClick={() => navigate(ROUTES.KYC)}>
              <span className="activity__mark">▦</span>
              Approve KYC documents
            </button>
            <button
              type="button"
              className="quick-action"
              onClick={() => navigate(ROUTES.PACKAGES)}
            >
              <span className="activity__mark">▣</span>
              Update packages and pricing
            </button>
            <button
              type="button"
              className="quick-action"
              onClick={() => navigate(ROUTES.COMMISSION_RULES)}
            >
              <span className="activity__mark">◇</span>
              Adjust commission rules
            </button>
            <button type="button" className="quick-action" onClick={() => navigate(ROUTES.USERS)}>
              <span className="activity__mark">◉</span>
              Manage members
            </button>
          </div>
        </Card>

        <Card
          title="Recent activity"
          subtitle="Latest movements on the wallet ledger"
          flush
        >
          {recent.walletTransactions.length === 0 ? (
            <EmptyState
              icon="≡"
              title="No ledger entries yet"
              message="Credits and debits will appear here as soon as commissions settle."
            />
          ) : (
            recent.walletTransactions.map((entry) => (
              <div className="activity" key={entry.id}>
                <span className="activity__mark" aria-hidden="true">
                  {entry.direction === "CREDIT" ? "↑" : "↓"}
                </span>
                <div className="u-grow">
                  <p className="activity__title">
                    {humanize(entry.transactionType)} · {formatMoney(entry.amount)}
                  </p>
                  <p className="activity__meta">
                    Member #{entry.userId} · balance now {formatMoney(entry.balanceAfter)} ·{" "}
                    {timeAgo(entry.createdAt)}
                  </p>
                </div>
                <StatusBadge value={entry.direction} />
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Latest records */}
      <div className="u-grid u-grid-2">
        <Card
          title="Latest orders"
          flush
          actions={
            <Button variant="link" onClick={() => navigate(ROUTES.ORDERS)}>
              View all
            </Button>
          }
        >
          {recent.orders.length === 0 ? (
            <EmptyState icon="⊞" title="No orders yet" message="New orders will show up here." />
          ) : (
            <Table columns={orderColumns} rows={recent.orders} />
          )}
        </Card>

        <Card
          title="Newest members"
          flush
          actions={
            <Button variant="link" onClick={() => navigate(ROUTES.USERS)}>
              View all
            </Button>
          }
        >
          {recent.users.length === 0 ? (
            <EmptyState
              icon="◉"
              title="No members yet"
              message="Sign-ups will show up here as they arrive."
            />
          ) : (
            <Table columns={memberColumns} rows={recent.users} />
          )}
        </Card>
      </div>
    </>
  );
};

export default DashboardPage;
