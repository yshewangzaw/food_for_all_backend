import Breadcrumb from "./Breadcrumb";

/** Title + description + breadcrumb + right-hand actions, on every page. */
const PageHeader = ({ title, description, breadcrumbs = [], actions = null }) => (
  <>
    <Breadcrumb items={breadcrumbs} />
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {description && <p className="page-head__desc">{description}</p>}
      </div>
      {actions && <div className="u-flex u-gap-2 u-wrap">{actions}</div>}
    </div>
  </>
);

export default PageHeader;
