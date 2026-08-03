import CrudPage from "../crud/CrudPage";
import paymentsConfig from "./paymentsConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in paymentsConfig.js.
 */
const PaymentsPage = () => <CrudPage config={paymentsConfig} />;

export default PaymentsPage;
