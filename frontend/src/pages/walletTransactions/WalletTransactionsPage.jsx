import CrudPage from "../crud/CrudPage";
import walletTransactionsConfig from "./walletTransactionsConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in walletTransactionsConfig.js.
 */
const WalletTransactionsPage = () => <CrudPage config={walletTransactionsConfig} />;

export default WalletTransactionsPage;
