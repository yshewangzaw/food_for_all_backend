import CrudPage from "../crud/CrudPage";
import commissionRulesConfig from "./commissionRulesConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in commissionRulesConfig.js.
 */
const CommissionRulesPage = () => <CrudPage config={commissionRulesConfig} />;

export default CommissionRulesPage;
