import CrudPage from "../crud/CrudPage";
import withdrawalRequestsConfig from "./withdrawalRequestsConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in withdrawalRequestsConfig.js.
 */
const WithdrawalRequestsPage = () => <CrudPage config={withdrawalRequestsConfig} />;

export default WithdrawalRequestsPage;
