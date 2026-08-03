import CrudPage from "../crud/CrudPage";
import orderItemsConfig from "./orderItemsConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in orderItemsConfig.js.
 */
const OrderItemsPage = () => <CrudPage config={orderItemsConfig} />;

export default OrderItemsPage;
