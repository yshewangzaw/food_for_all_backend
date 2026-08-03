import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/card/Card";
import Table from "../../components/table/Table";
import StatusBadge from "../../components/statusBadge/StatusBadge";
import PageLoader from "../../components/loading/PageLoader";
import EmptyState from "../../components/emptyState/EmptyState";
import Button from "../../components/button/Button";
import useFetch from "../../hooks/useFetch";
import userService from "../../services/userService";
import ROUTES from "../../constants/routes";
import { USER_ROLES } from "../../constants/appConstants";
import { countBy, humanize } from "../../utils/helpers";

/**
 * TODO(backend): there is no roles table or /api/roles endpoint. `role` is an
 * ENUM("ADMIN","MEMBER") column on the users table (backend/src/models/User.js),
 * so this page is read-only: it lists the two roles and counts how many members
 * hold each. To change someone's role, edit them on the Members page.
 *
 * When a real roles/permissions API arrives, swap userService for roleService
 * and turn this into a normal CrudPage.
 */

const ROLE_NOTES = {
  ADMIN:
    "Full access to the console: reviews payments, approves KYC and releases withdrawals.",
  MEMBER:
    "A member of the network. Buys packages, earns commission and requests payouts.",
};

const RolesPage = () => {
  const { data, isLoading, error, reload } = useFetch(() => userService.getAll(), [], []);

  const counts = countBy(data, "role");

  const rows = USER_ROLES.map((role) => ({
    id: role,
    role,
    memberCount: counts[role] || 0,
    description: ROLE_NOTES[role],
  }));

  const columns = [
    {
      key: "role",
      label: "Role",
      render: (value) => <StatusBadge value={value} />,
    },
    {
      key: "memberCount",
      label: "People with this role",
      align: "right",
      render: (value) => <span className="u-mono">{value}</span>,
    },
    { key: "description", label: "What it means" },
  ];

  return (
    <>
      <PageHeader
        title="Roles"
        description="The two access levels the backend recognises, and who holds them."
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Roles" }]}
        actions={
          <Button variant="secondary" onClick={reload} disabled={isLoading}>
            Refresh
          </Button>
        }
      />

      <p className="notice notice--info u-mb-4">
        Roles are a fixed ENUM on the users table, not their own resource, so they can&apos;t be
        created or deleted here. To change a person&apos;s role, edit them on the Members page.
      </p>

      <Card flush>
        {isLoading ? (
          <PageLoader message="Counting members by role" />
        ) : error ? (
          <EmptyState
            icon="!"
            title="Couldn't load member counts"
            message={error}
            actionLabel="Try again"
            onAction={reload}
          />
        ) : (
          <Table columns={columns} rows={rows} rowKey="id" />
        )}
      </Card>

      <Card title="Status values" subtitle="The other ENUMs that control access" className="u-mt-4">
        <p className="u-muted u-small u-mb-4">
          A person&apos;s role decides what they can reach; their status decides whether they can
          sign in at all. Both are set on the Members page.
        </p>
        <div className="u-grid u-grid-3">
          {["ACTIVE", "PENDING", "INACTIVE", "SUSPENDED", "BLOCKED"].map((status) => (
            <div key={status} className="feature">
              <StatusBadge value={status} />
              <p className="feature__text u-mt-2">
                {status === "ACTIVE" && "Signed up, paid for an entry package, fully enabled."}
                {status === "PENDING" && "Registered but not yet activated by a paid order."}
                {status === "INACTIVE" && "Lapsed — no longer meeting monthly qualification."}
                {status === "SUSPENDED" && "Temporarily stopped, usually pending a review."}
                {status === "BLOCKED" && "Permanently barred from the platform."}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
};

export default RolesPage;
