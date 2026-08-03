import CrudPage from "../crud/CrudPage";
import networkPathsConfig from "./networkPathsConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in networkPathsConfig.js.
 */
const NetworkPathsPage = () => <CrudPage config={networkPathsConfig} />;

export default NetworkPathsPage;
