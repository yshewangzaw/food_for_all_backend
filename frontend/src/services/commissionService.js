import api from "../api/axios";
import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

/** Full CRUD + lookup by user — backend routes/commissionRoutes.js */
const base = createCrudService(
  ENDPOINTS.COMMISSIONS.BASE,
  ENDPOINTS.COMMISSIONS.BY_ID
);

const commissionService = {
  ...base,

  /** GET /api/commissions/user/:userId */
  getByUserId: async (userId) => {
    const response = await api.get(ENDPOINTS.COMMISSIONS.BY_USER(userId));
    return response.data?.data ?? [];
  },
};

export default commissionService;
