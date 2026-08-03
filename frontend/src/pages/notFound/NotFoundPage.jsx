import { Link } from "react-router-dom";
import Button from "../../components/button/Button";
import ROUTES from "../../constants/routes";

const NotFoundPage = () => (
  <div
    className="u-center u-flex-col u-gap-3"
    style={{ minHeight: "70vh", textAlign: "center", padding: "24px" }}
  >
    <p className="u-mono u-faint" style={{ fontSize: "13px", letterSpacing: "0.1em" }}>
      404
    </p>
    <h1>That page doesn&apos;t exist</h1>
    <p className="u-muted" style={{ maxWidth: 420 }}>
      The link may be out of date, or the record it pointed at has been deleted.
    </p>
    <div className="u-flex u-gap-2 u-mt-2">
      <Link to={ROUTES.DASHBOARD}>
        <Button variant="primary">Go to the dashboard</Button>
      </Link>
      <Link to={ROUTES.LANDING}>
        <Button variant="secondary">Home page</Button>
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
