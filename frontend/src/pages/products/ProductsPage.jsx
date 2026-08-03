import CrudPage from "../crud/CrudPage";
import productsConfig from "./productsConfig";

/**
 * Thin wrapper: all list/create/edit/view/delete behaviour lives in CrudPage,
 * and everything specific to this module lives in productsConfig.js.
 */
const ProductsPage = () => <CrudPage config={productsConfig} />;

export default ProductsPage;
