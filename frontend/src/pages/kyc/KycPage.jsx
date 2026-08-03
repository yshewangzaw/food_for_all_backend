import CrudPage from "../crud/CrudPage";
import kycConfig from "./kycConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in kycConfig.js.
 */
const KycPage = () => <CrudPage config={kycConfig} />;

export default KycPage;
