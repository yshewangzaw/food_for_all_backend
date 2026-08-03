import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

/** Full CRUD — backend routes/networkPathRoutes.js (closure table of the tree) */
const networkPathService = createCrudService(
  ENDPOINTS.NETWORK_PATHS.BASE,
  ENDPOINTS.NETWORK_PATHS.BY_ID
);

export default networkPathService;
