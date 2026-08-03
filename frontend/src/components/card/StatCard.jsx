import { Link } from "react-router-dom";

/**
 * One headline number on the dashboard.
 * tone: brand (default) | amber | blue | violet | rose
 */
const StatCard = ({ label, value, meta, tone = "brand", to }) => {
  const body = (
    <div className={`stat${tone !== "brand" ? ` stat--${tone}` : ""}`}>
      <p className="stat__label">{label}</p>
      <p className="stat__value">{value}</p>
      {meta && <p className="stat__meta">{meta}</p>}
    </div>
  );

  // Most stats double as a shortcut into the matching list page.
  return to ? (
    <Link to={to} style={{ color: "inherit", display: "block" }}>
      {body}
    </Link>
  ) : (
    body
  );
};

export default StatCard;
