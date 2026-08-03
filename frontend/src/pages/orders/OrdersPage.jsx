import CrudPage from "../crud/CrudPage";
import ordersConfig from "./ordersConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in ordersConfig.js.
 */
const OrdersPage = () => <CrudPage config={ordersConfig} />;

export default OrdersPage;
