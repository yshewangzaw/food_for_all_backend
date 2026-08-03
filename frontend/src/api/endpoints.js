/**
 * Every path below was read directly from the backend router files
 * (backend/src/app.js + backend/src/routes/*.js).
 * Nothing here is invented. Paths are relative to VITE_API_BASE_URL.
 *
 * Envelope returned by every backend controller:
 *   success -> { success: true, data: <payload> }   (or { success: true, message })
 *   failure -> { success: false, message: <string> }
 */

export const ENDPOINTS = {
  // ---- /api/auth (authRoutes.js) ----
  AUTH: {
    LOGIN: "/auth/login", // POST -> { data: { user, token } }
    REGISTER: "/auth/register", // POST -> { data: { id, fullName, email, phone, referralCode, role } }
    FORGOT_PASSWORD: "/auth/forgot-password", // POST -> { message }
    RESET_PASSWORD: "/auth/reset-password", // POST -> { message }
    // TODO(backend): no GET /auth/me exists. The signed-in user is restored from
    // storage on refresh. Add the endpoint and wire it up in authService.getCurrentUser().
  },

  // ---- /api/users (userRoutes.js) ----
  USERS: {
    BASE: "/users",
    BY_ID: (id) => `/users/${id}`,
  },

  // ---- /api/network-paths (networkPathRoutes.js) ----
  NETWORK_PATHS: {
    BASE: "/network-paths",
    BY_ID: (id) => `/network-paths/${id}`,
  },

  // ---- /api/products (productRoutes.js) ----
  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id) => `/products/${id}`,
  },

  // ---- /api/packages (packageRoutes.js) ----
  PACKAGES: {
    BASE: "/packages",
    BY_ID: (id) => `/packages/${id}`,
  },

  // ---- /api/package-items (packageItemRoutes.js) ----
  PACKAGE_ITEMS: {
    BASE: "/package-items",
    BY_ID: (id) => `/package-items/${id}`,
  },

  // ---- /api/orders (orderRoutes.js) ----
  ORDERS: {
    BASE: "/orders",
    BY_ID: (id) => `/orders/${id}`,
  },

  // ---- /api/order-items (orderItemRoutes.js) ----
  ORDER_ITEMS: {
    BASE: "/order-items",
    BY_ID: (id) => `/order-items/${id}`,
    BY_ORDER: (orderId) => `/order-items/order/${orderId}`,
  },

  // ---- /api/commissions (commissionRoutes.js) ----
  COMMISSIONS: {
    BASE: "/commissions",
    BY_ID: (id) => `/commissions/${id}`,
    BY_USER: (userId) => `/commissions/user/${userId}`,
  },

  // ---- /api/commission-rules (commissionRuleRoutes.js) ----
  COMMISSION_RULES: {
    BASE: "/commission-rules",
    BY_ID: (id) => `/commission-rules/${id}`,
  },

  // ---- /api/level-configurations (levelConfigurationRoutes.js) ----
  LEVEL_CONFIGURATIONS: {
    BASE: "/level-configurations",
    BY_ID: (id) => `/level-configurations/${id}`,
  },

  // ---- /api/payment-methods (paymentMethodRoutes.js) ----
  PAYMENT_METHODS: {
    BASE: "/payment-methods",
    BY_ID: (id) => `/payment-methods/${id}`,
  },

  // ---- /api/payments (paymentRoutes.js) ----
  PAYMENTS: {
    BASE: "/payments",
    BY_ID: (id) => `/payments/${id}`,
  },

  // ---- /api/withdrawal-requests (withdrawalRequestRoutes.js) ----
  WITHDRAWAL_REQUESTS: {
    BASE: "/withdrawal-requests",
    BY_ID: (id) => `/withdrawal-requests/${id}`,
    BY_USER: (userId) => `/withdrawal-requests/user/${userId}`,
  },

  // ---- /api/wallet-transactions (walletTransactionRoutes.js) ----
  // NOTE: this router exposes GET and POST only — there is no PUT or DELETE.
  WALLET_TRANSACTIONS: {
    BASE: "/wallet-transactions",
    BY_ID: (id) => `/wallet-transactions/${id}`,
    BY_USER: (userId) => `/wallet-transactions/user/${userId}`,
  },

  // ---- /api/notifications (notificationRoutes.js) ----
  NOTIFICATIONS: {
    BASE: "/notifications",
    BY_ID: (id) => `/notifications/${id}`,
    BY_USER: (userId) => `/notifications/user/${userId}`,
  },

  // ---- /api/kyc (kycRoutes.js) ----
  KYC: {
    BASE: "/kyc",
    BY_ID: (id) => `/kyc/${id}`,
  },

  // TODO(backend): kycDocumentRoutes.js exists in the repo but is NOT mounted in
  // app.js and its controller file is missing, so there is no /api/kyc-documents.
  // The KYC page uses /api/kyc, which serves the same KycDocument model.

  // TODO(backend): there is no /api/dashboard/stats endpoint. The dashboard
  // derives its numbers by reading the list endpoints above — see
  // services/dashboardService.js. Replace it with one call when the endpoint exists.
};

export default ENDPOINTS;
