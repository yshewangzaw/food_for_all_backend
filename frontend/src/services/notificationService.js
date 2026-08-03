import api from "../api/axios";
import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

/** Full CRUD + lookup by user — backend routes/notificationRoutes.js */
const base = createCrudService(
  ENDPOINTS.NOTIFICATIONS.BASE,
  ENDPOINTS.NOTIFICATIONS.BY_ID
);

const notificationService = {
  ...base,

  /** GET /api/notifications/user/:userId */
  getByUserId: async (userId) => {
    const response = await api.get(ENDPOINTS.NOTIFICATIONS.BY_USER(userId));
    return response.data?.data ?? [];
  },

  /**
   * There is no dedicated "mark read" route, so we reuse PUT /:id — the
   * controller passes req.body straight to the model.
   */
  markAsRead: async (id) => {
    const response = await api.put(ENDPOINTS.NOTIFICATIONS.BY_ID(id), {
      isRead: true,
      readAt: new Date().toISOString(),
    });
    return response.data?.data ?? null;
  },
};

export default notificationService;
