/**
 * Single source of truth for every URL in the app.
 * Import from here instead of typing path strings inline.
 */

export const ROUTES = {
  // Public
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  RESET_PASSWORD: "/reset-password",

  // Private
  DASHBOARD: "/app/dashboard",
  PROFILE: "/app/profile",
  SETTINGS: "/app/settings",
  ROLES: "/app/roles",

  USERS: "/app/users",
  NETWORK_PATHS: "/app/network-paths",

  PRODUCTS: "/app/products",
  PACKAGES: "/app/packages",
  PACKAGE_ITEMS: "/app/package-items",

  ORDERS: "/app/orders",
  ORDER_ITEMS: "/app/order-items",

  COMMISSIONS: "/app/commissions",
  COMMISSION_RULES: "/app/commission-rules",
  LEVEL_CONFIGURATIONS: "/app/level-configurations",

  PAYMENTS: "/app/payments",
  PAYMENT_METHODS: "/app/payment-methods",
  WITHDRAWAL_REQUESTS: "/app/withdrawal-requests",
  WALLET_TRANSACTIONS: "/app/wallet-transactions",

  KYC: "/app/kyc",
  NOTIFICATIONS: "/app/notifications",

  NOT_FOUND: "*",
};

export default ROUTES;
