import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

/** Full CRUD — backend routes/productRoutes.js */
const productService = createCrudService(
  ENDPOINTS.PRODUCTS.BASE,
  ENDPOINTS.PRODUCTS.BY_ID
);

export default productService;
