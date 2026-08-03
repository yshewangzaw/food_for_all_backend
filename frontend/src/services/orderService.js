import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

/** Full CRUD — backend routes/orderRoutes.js */
const orderService = createCrudService(
  ENDPOINTS.ORDERS.BASE,
  ENDPOINTS.ORDERS.BY_ID
);

export default orderService;
