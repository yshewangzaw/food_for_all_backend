import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

/**
 * Full CRUD — backend routes/kycRoutes.js (mounted at /api/kyc).
 * It serves the KycDocument model.
 */
const kycService = createCrudService(ENDPOINTS.KYC.BASE, ENDPOINTS.KYC.BY_ID);

export default kycService;
