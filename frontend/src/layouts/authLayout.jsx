import { Link, Outlet } from "react-router-dom";
import TestModeBanner from "../components/layout/TestModeBanner";
import ROUTES from "../constants/routes";
import { APP_NAME } from "../constants/appConstants";

/**
 * Two-panel shell for Login and Register. The left panel explains what the
 * console is for; the right panel holds the form (<Outlet />).
 * On small screens the left panel is hidden.
 */
const AuthLayout = () => (
  <>
    <TestModeBanner />

    <div className="auth">
      <aside className="auth__aside">
        <Link to={ROUTES.LANDING} className="auth__brand">
          <span className="sidebar__logo" aria-hidden="true">
            N
          </span>
          <span className="sidebar__name">{APP_NAME}</span>
        </Link>

        <div className="auth__pitch">
          <h2>Every member, order and birr in one console.</h2>
          <p>
            Approve payments, review KYC, settle commissions and release
            withdrawals without leaving the browser.
          </p>
          <ul className="auth__points">
            <li>
              <span>01</span> Members, sponsors and the full network tree
            </li>
            <li>
              <span>02</span> Packages, products and the orders they generate
            </li>
            <li>
              <span>03</span> Commission rules, the wallet ledger and payouts
            </li>
          </ul>
        </div>

        <p className="u-small" style={{ color: "#6b7c93", position: "relative", zIndex: 1 }}>
          Authorised staff only. Sessions expire after 7 days.
        </p>
      </aside>

      <div className="auth__panel">
        <div className="auth__form">
          <Outlet />
        </div>
      </div>
    </div>
  </>
);

export default AuthLayout;
