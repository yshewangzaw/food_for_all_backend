import api from "../api/axios";
import ENDPOINTS from "../api/endpoints";

/**
 * backend routes/walletTransactionRoutes.js exposes GET and POST only.
 * The ledger is immutable (WalletTransaction sets updatedAt:false), so there
 * is deliberately no update() or remove() here.
 * TODO(backend): add PUT/DELETE only if the ledger is ever meant to be edited.
 */
const walletTransactionService = {
  getAll: async (params, config = {}) => {
    const response = await api.get(ENDPOINTS.WALLET_TRANSACTIONS.BASE, {
      params,
      ...config,
    });
    return response.data?.data ?? [];
  },

  getById: async (id) => {
    const response = await api.get(ENDPOINTS.WALLET_TRANSACTIONS.BY_ID(id));
    return response.data?.data ?? null;
  },

  getByUserId: async (userId) => {
    const response = await api.get(ENDPOINTS.WALLET_TRANSACTIONS.BY_USER(userId));
    return response.data?.data ?? [];
  },

  create: async (payload) => {
    const response = await api.post(ENDPOINTS.WALLET_TRANSACTIONS.BASE, payload);
    return response.data?.data ?? null;
  },
};

export default walletTransactionService;
