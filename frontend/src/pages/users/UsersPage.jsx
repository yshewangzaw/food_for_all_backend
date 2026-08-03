import CrudPage from "../crud/CrudPage";
import usersConfig from "./usersConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in usersConfig.js.
 */
const UsersPage = () => <CrudPage config={usersConfig} />;

export default UsersPage;
