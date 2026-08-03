import api from "../api/axios";
import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

/** Full CRUD + lookup by order — backend routes/orderItemRoutes.js */
const base = createCrudService(
  ENDPOINTS.ORDER_ITEMS.BASE,
  ENDPOINTS.ORDER_ITEMS.BY_ID
);

const orderItemService = {
  ...base,

  /** GET /api/order-items/order/:orderId */
  getByOrderId: async (orderId) => {
    const response = await api.get(ENDPOINTS.ORDER_ITEMS.BY_ORDER(orderId));
    return response.data?.data ?? [];
  },
};

export default orderItemService;
