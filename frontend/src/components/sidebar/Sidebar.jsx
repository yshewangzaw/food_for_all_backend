import { NavLink } from "react-router-dom";
import ROUTES from "../../constants/routes";
import { APP_NAME } from "../../constants/appConstants";

/**
 * Navigation, grouped the way the backend is actually organised: the network
 * of members, the catalog they sell, the sales those create, the money that
 * results, and the compliance around it.
 *
 * To add a page: add a route to constants/routes.js, then add a line here.
 */
export const NAV_GROUPS = [
  {
    label: "Overview",
    links: [{ to: ROUTES.DASHBOARD, label: "Dashboard", icon: "▤" }],
  },
  {
    label: "Network",
    links: [
      { to: ROUTES.USERS, label: "Members", icon: "◉" },
      { to: ROUTES.NETWORK_PATHS, label: "Network paths", icon: "⑂" },
      { to: ROUTES.ROLES, label: "Roles", icon: "⚿" },
    ],
  },
  {
    label: "Catalog",
    links: [
      { to: ROUTES.PRODUCTS, label: "Products", icon: "▢" },
      { to: ROUTES.PACKAGES, label: "Packages", icon: "▣" },
      { to: ROUTES.PACKAGE_ITEMS, label: "Package items", icon: "▥" },
    ],
  },
  {
    label: "Sales",
    links: [
      { to: ROUTES.ORDERS, label: "Orders", icon: "⊞" },
      { to: ROUTES.ORDER_ITEMS, label: "Order items", icon: "⊟" },
      { to: ROUTES.PAYMENTS, label: "Payments", icon: "⊡" },
      { to: ROUTES.PAYMENT_METHODS, label: "Payment methods", icon: "⊠" },
    ],
  },
  {
    label: "Earnings",
    links: [
      { to: ROUTES.COMMISSIONS, label: "Commissions", icon: "◈" },
      { to: ROUTES.COMMISSION_RULES, label: "Commission rules", icon: "◇" },
      { to: ROUTES.LEVEL_CONFIGURATIONS, label: "Level configuration", icon: "◆" },
      { to: ROUTES.WALLET_TRANSACTIONS, label: "Wallet ledger", icon: "≡" },
      { to: ROUTES.WITHDRAWAL_REQUESTS, label: "Withdrawals", icon: "↧" },
    ],
  },
  {
    label: "Compliance",
    links: [{ to: ROUTES.KYC, label: "KYC documents", icon: "▦" }],
  },
  {
    label: "System",
    links: [
      { to: ROUTES.NOTIFICATIONS, label: "Notifications", icon: "◔" },
      { to: ROUTES.SETTINGS, label: "Settings", icon: "⚙" },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => (
  <>
    {isOpen && <div className="sidebar__scrim" onClick={onClose} role="presentation" />}

    <aside className={`sidebar${isOpen ? " sidebar--open" : ""}`}>
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">
          N
        </span>
        <span className="sidebar__name">{APP_NAME}</span>
      </div>

      <nav className="sidebar__nav" aria-label="Main">
        {NAV_GROUPS.map((group) => (
          <div className="sidebar__group" key={group.label}>
            <p className="sidebar__group-label">{group.label}</p>
            {group.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar__link${isActive ? " sidebar__link--active" : ""}`
                }
              >
                <span className="sidebar__icon" aria-hidden="true">
                  {link.icon}
                </span>
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar__foot">v1.0.0 · Admin console</div>
    </aside>
  </>
);

export default Sidebar;
