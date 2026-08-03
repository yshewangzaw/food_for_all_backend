import CrudPage from "../crud/CrudPage";
import packageItemsConfig from "./packageItemsConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in packageItemsConfig.js.
 */
const PackageItemsPage = () => <CrudPage config={packageItemsConfig} />;

export default PackageItemsPage;
