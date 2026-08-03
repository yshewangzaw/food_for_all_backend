import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/authLayout";
import DashboardLayout from "../layouts/dashboardLayout";
import PrivateRoute from "./privateRoute";
import ROUTES from "../constants/routes";

// Public
import LandingPage from "../pages/landing/LandingPage";
import LoginPage from "../pages/login/LoginPage";
import RegisterPage from "../pages/register/RegisterPage";
import ResetPasswordPage from "../pages/resetPassword/ResetPasswordPage";

// Private — general
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProfilePage from "../pages/profile/ProfilePage";
import SettingsPage from "../pages/settings/SettingsPage";
import RolesPage from "../pages/roles/RolesPage";
import NotFoundPage from "../pages/notFound/NotFoundPage";

// Private — one page per backend module
import UsersPage from "../pages/users/UsersPage";
import NetworkPathsPage from "../pages/networkPaths/NetworkPathsPage";
import ProductsPage from "../pages/products/ProductsPage";
import PackagesPage from "../pages/packages/PackagesPage";
import PackageItemsPage from "../pages/packageItems/PackageItemsPage";
import OrdersPage from "../pages/orders/OrdersPage";
import OrderItemsPage from "../pages/orderItems/OrderItemsPage";
import CommissionsPage from "../pages/commissions/CommissionsPage";
import CommissionRulesPage from "../pages/commissionRules/CommissionRulesPage";
import LevelConfigurationsPage from "../pages/levelConfigurations/LevelConfigurationsPage";
import PaymentsPage from "../pages/payments/PaymentsPage";
import PaymentMethodsPage from "../pages/paymentMethods/PaymentMethodsPage";
import WithdrawalRequestsPage from "../pages/withdrawalRequests/WithdrawalRequestsPage";
import WalletTransactionsPage from "../pages/walletTransactions/WalletTransactionsPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import KycPage from "../pages/kyc/KycPage";

/**
 * Every route in the app.
 *
 * Public routes render inside AuthLayout (login/register) or on their own
 * (landing). Private routes sit behind <PrivateRoute>, which redirects anyone
 * without a token to the sign-in page.
 *
 * To add a page: add its path to constants/routes.js, add a <Route> below, and
 * add a link in components/sidebar/Sidebar.jsx.
 */
const AppRoutes = () => (
  <Routes>
    {/* ---------- Public ---------- */}
    <Route path={ROUTES.LANDING} element={<LandingPage />} />

    <Route element={<AuthLayout />}>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
    </Route>

    {/* ---------- Private ---------- */}
    <Route
      path="/app"
      element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }
    >
      {/* /app on its own lands on the dashboard */}
      <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />

      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="roles" element={<RolesPage />} />

      {/* Network */}
      <Route path="users" element={<UsersPage />} />
      <Route path="network-paths" element={<NetworkPathsPage />} />

      {/* Catalog */}
      <Route path="products" element={<ProductsPage />} />
      <Route path="packages" element={<PackagesPage />} />
      <Route path="package-items" element={<PackageItemsPage />} />

      {/* Sales */}
      <Route path="orders" element={<OrdersPage />} />
      <Route path="order-items" element={<OrderItemsPage />} />
      <Route path="payments" element={<PaymentsPage />} />
      <Route path="payment-methods" element={<PaymentMethodsPage />} />

      {/* Earnings */}
      <Route path="commissions" element={<CommissionsPage />} />
      <Route path="commission-rules" element={<CommissionRulesPage />} />
      <Route path="level-configurations" element={<LevelConfigurationsPage />} />
      <Route path="wallet-transactions" element={<WalletTransactionsPage />} />
      <Route path="withdrawal-requests" element={<WithdrawalRequestsPage />} />

      {/* Compliance & system */}
      <Route path="kyc" element={<KycPage />} />
      <Route path="notifications" element={<NotificationsPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Route>

    {/* ---------- Anything else ---------- */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
