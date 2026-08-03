import { Link } from "react-router-dom";

/**
 * <Breadcrumb items={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Members" }]} />
 * The last item is always the current page and is not a link.
 */
const Breadcrumb = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="u-flex u-items-center u-gap-2">
            {isLast || !item.to ? (
              <span className={isLast ? "breadcrumb__current" : undefined}>{item.label}</span>
            ) : (
              <Link to={item.to}>{item.label}</Link>
            )}
            {!isLast && (
              <span className="breadcrumb__sep" aria-hidden="true">
                /
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
