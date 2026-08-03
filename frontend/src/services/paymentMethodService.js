import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

/** Full CRUD — backend routes/paymentMethodRoutes.js */
const paymentMethodService = createCrudService(
  ENDPOINTS.PAYMENT_METHODS.BASE,
  ENDPOINTS.PAYMENT_METHODS.BY_ID
);

export default paymentMethodService;
