import CrudPage from "../crud/CrudPage";
import paymentMethodsConfig from "./paymentMethodsConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in paymentMethodsConfig.js.
 */
const PaymentMethodsPage = () => <CrudPage config={paymentMethodsConfig} />;

export default PaymentMethodsPage;
