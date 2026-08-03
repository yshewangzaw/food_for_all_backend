import CrudPage from "../crud/CrudPage";
import notificationsConfig from "./notificationsConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in notificationsConfig.js.
 */
const NotificationsPage = () => <CrudPage config={notificationsConfig} />;

export default NotificationsPage;
