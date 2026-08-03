import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/card/Card";
import Button from "../../components/button/Button";
import StatusBadge from "../../components/statusBadge/StatusBadge";
import DetailList from "../../components/layout/DetailList";
import ConfirmationModal from "../../components/confirmationModal/ConfirmationModal";
import useAuth from "../../hooks/useAuth";
import storage from "../../utils/storage";
import ROUTES from "../../constants/routes";
import { PAGE_SIZE } from "../../constants/appConstants";

/**
 * TODO(backend): there is no settings endpoint. Nothing on this page is
 * persisted server-side — it reports the environment the app is running in and
 * offers session controls. Wire it to a real /api/settings resource when one
 * exists.
 */

/** Every module the console talks to, and what the backend actually allows. */
const MODULES = [
  { name: "Members", path: "/api/users", operations: "Create, read, update, delete" },
  { name: "Network paths", path: "/api/network-paths", operations: "Create, read, update, delete" },
  { name: "Products", path: "/api/products", operations: "Create, read, update, delete" },
  { name: "Packages", path: "/api/packages", operations: "Create, read, update, delete" },
  { name: "Package items", path: "/api/package-items", operations: "Create, read, update, delete" },
  { name: "Orders", path: "/api/orders", operations: "Create, read, update, delete" },
  { name: "Order items", path: "/api/order-items", operations: "Create, read, update, delete" },
  { name: "Commissions", path: "/api/commissions", operations: "Create, read, update, delete" },
  { name: "Commission rules", path: "/api/commission-rules", operations: "Create, read, update, delete" },
  { name: "Level configuration", path: "/api/level-configurations", operations: "Create, read, update, delete" },
  { name: "Payments", path: "/api/payments", operations: "Create, read, update, delete" },
  { name: "Payment methods", path: "/api/payment-methods", operations: "Create, read, update, delete" },
  { name: "Withdrawals", path: "/api/withdrawal-requests", operations: "Create, read, update, delete" },
  { name: "Wallet ledger", path: "/api/wallet-transactions", operations: "Create and read only" },
  { name: "Notifications", path: "/api/notifications", operations: "Create, read, update, delete" },
  { name: "KYC documents", path: "/api/kyc", operations: "Create, read, update, delete" },
];

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const hasToken = Boolean(storage.getToken());

  const handleClearSession = () => {
    logout();
    setIsConfirmOpen(false);
    toast.success("Local session cleared.");
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="How this console is configured and what it's connected to."
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Settings" }]}
      />

      <p className="notice u-mb-4">
        The backend has no settings endpoint yet, so nothing on this page is saved to the
        server. It reports the current environment and lets you reset your local session.
      </p>

      <div className="u-grid u-grid-2 u-mb-4">
        <Card title="Connection" subtitle="Read from your .env file at build time">
          <DetailList
            items={[
              {
                label: "API base URL",
                value: apiUrl ? (
                  <span className="u-mono">{apiUrl}</span>
                ) : (
                  <StatusBadge value="not set" tone="danger" label="Not configured" />
                ),
                wide: true,
              },
              {
                label: "Environment variable",
                value: <span className="u-mono">VITE_API_BASE_URL</span>,
              },
              { label: "Mode", value: import.meta.env.MODE },
              { label: "Rows per page", value: PAGE_SIZE },
              {
                label: "Request timeout",
                value: "20 seconds",
              },
            ]}
          />
          {!apiUrl && (
            <p className="notice u-mt-4">
              No API URL is set. Add VITE_API_BASE_URL to your .env file and restart the dev
              server — every request will fail until you do.
            </p>
          )}
        </Card>

        <Card title="Your session" subtitle="Held in this browser only">
          <DetailList
            items={[
              { label: "Signed in as", value: user?.fullName || "—" },
              { label: "Email", value: user?.email || "—" },
              { label: "Role", value: <StatusBadge value={user?.role} /> },
              { label: "User id", value: user?.id ? `#${user.id}` : "—" },
              {
                label: "Token stored",
                value: (
                  <StatusBadge
                    value={hasToken ? "yes" : "no"}
                    tone={hasToken ? "success" : "danger"}
                    label={hasToken ? "Yes" : "No"}
                  />
                ),
              },
              { label: "Token lifetime", value: "7 days from sign-in" },
            ]}
          />
          <div className="form__actions">
            <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
              Clear session and sign out
            </Button>
          </div>
        </Card>
      </div>

      <Card
        title="Connected modules"
        subtitle="Every endpoint this console reads from or writes to"
        flush
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Endpoint</th>
                <th>Operations available</th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map((module) => (
                <tr key={module.path}>
                  <td className="u-bold">{module.name}</td>
                  <td>
                    <span className="u-mono">{module.path}</span>
                  </td>
                  <td className="u-muted">{module.operations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        tone="warning"
        title="Clear your session?"
        message="Your token and stored account details will be removed from this browser and you'll be returned to the sign-in page."
        confirmLabel="Clear session"
        onConfirm={handleClearSession}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
};

export default SettingsPage;
