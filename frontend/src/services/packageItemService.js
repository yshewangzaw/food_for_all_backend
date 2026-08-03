import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

/** Full CRUD — backend routes/packageItemRoutes.js */
const packageItemService = createCrudService(
  ENDPOINTS.PACKAGE_ITEMS.BASE,
  ENDPOINTS.PACKAGE_ITEMS.BY_ID
);

export default packageItemService;
