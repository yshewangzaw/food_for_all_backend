import CrudPage from "../crud/CrudPage";
import levelConfigurationsConfig from "./levelConfigurationsConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in levelConfigurationsConfig.js.
 */
const LevelConfigurationsPage = () => <CrudPage config={levelConfigurationsConfig} />;

export default LevelConfigurationsPage;
