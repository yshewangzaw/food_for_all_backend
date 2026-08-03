import api from "../api/axios";
import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

/** GET/POST/PUT/DELETE /api/users — see backend routes/userRoutes.js */
const base = createCrudService(ENDPOINTS.USERS.BASE, ENDPOINTS.USERS.BY_ID);

const userService = {
  ...base,

  /**
   * The backend has no /users/me. We read the signed-in user's row by the id
   * stored at login. Used by the Profile page.
   */
  getProfile: async (userId) => {
    const response = await api.get(ENDPOINTS.USERS.BY_ID(userId));
    return response.data?.data ?? null;
  },

  updateProfile: async (userId, payload) => {
    const response = await api.put(ENDPOINTS.USERS.BY_ID(userId), payload);
    return response.data?.data ?? null;
  },
};

export default userService;
