import api from "../api/axios";
import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

/** Full CRUD + lookup by user — backend routes/withdrawalRequestRoutes.js */
const base = createCrudService(
  ENDPOINTS.WITHDRAWAL_REQUESTS.BASE,
  ENDPOINTS.WITHDRAWAL_REQUESTS.BY_ID
);

const withdrawalRequestService = {
  ...base,

  /** GET /api/withdrawal-requests/user/:userId */
  getByUserId: async (userId) => {
    const response = await api.get(ENDPOINTS.WITHDRAWAL_REQUESTS.BY_USER(userId));
    return response.data?.data ?? [];
  },
};

export default withdrawalRequestService;
