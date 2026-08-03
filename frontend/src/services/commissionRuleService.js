import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

/** Full CRUD — backend routes/commissionRuleRoutes.js */
const commissionRuleService = createCrudService(
  ENDPOINTS.COMMISSION_RULES.BASE,
  ENDPOINTS.COMMISSION_RULES.BY_ID
);

export default commissionRuleService;
