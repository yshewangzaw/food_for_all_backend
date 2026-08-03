import CrudPage from "../crud/CrudPage";
import packagesConfig from "./packagesConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in packagesConfig.js.
 */
const PackagesPage = () => <CrudPage config={packagesConfig} />;

export default PackagesPage;
