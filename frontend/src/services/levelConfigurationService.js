import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

/** Full CRUD — backend routes/levelConfigurationRoutes.js */
const levelConfigurationService = createCrudService(
  ENDPOINTS.LEVEL_CONFIGURATIONS.BASE,
  ENDPOINTS.LEVEL_CONFIGURATIONS.BY_ID
);

export default levelConfigurationService;
