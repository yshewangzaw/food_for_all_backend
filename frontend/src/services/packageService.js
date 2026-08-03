import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

/** Full CRUD — backend routes/packageRoutes.js */
const packageService = createCrudService(
  ENDPOINTS.PACKAGES.BASE,
  ENDPOINTS.PACKAGES.BY_ID
);

export default packageService;
