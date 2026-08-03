import Spinner from "./Spinner";

/** Full-panel loader shown while a page's first request is in flight. */
const PageLoader = ({ message = "Loading" }) => (
  <div className="page-loader">
    <Spinner size="lg" />
    <span>{message}</span>
  </div>
);

export default PageLoader;
