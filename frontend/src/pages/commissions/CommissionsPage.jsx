import CrudPage from "../crud/CrudPage";
import commissionsConfig from "./commissionsConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in commissionsConfig.js.
 */
const CommissionsPage = () => <CrudPage config={commissionsConfig} />;

export default CommissionsPage;
