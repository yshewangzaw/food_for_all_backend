import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

/** Full CRUD — backend routes/paymentRoutes.js */
const paymentService = createCrudService(
  ENDPOINTS.PAYMENTS.BASE,
  ENDPOINTS.PAYMENTS.BY_ID
);

export default paymentService;
