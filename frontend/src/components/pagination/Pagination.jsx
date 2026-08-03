import { PAGE_SIZE_OPTIONS } from "../../constants/appConstants";

/** Builds [1, "...", 4, 5, 6, "...", 20] so the control stays narrow. */
const buildPages = (current, total) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("start-gap");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push("end-gap");
  pages.push(total);

  return pages;
};

/**
 * Works for client-side and server-side lists alike — the parent just tells it
 * the current page, the total row count and what to do on change.
 */
const Pagination = ({
  page,
  totalPages,
  total,
  perPage,
  onPageChange,
  onPerPageChange,
}) => {
  if (!total) return null;

  const firstRow = (page - 1) * perPage + 1;
  const lastRow = Math.min(page * perPage, total);
  const pages = buildPages(page, totalPages);

  return (
    <>
      <div className="u-flex u-items-center u-gap-3 u-small u-muted">
        <span>
          Showing <strong>{firstRow}</strong>–<strong>{lastRow}</strong> of{" "}
          <strong>{total}</strong>
        </span>
        {onPerPageChange && (
          <label className="u-flex u-items-center u-gap-2">
            <span>Rows</span>
            <select
              className="pagination__btn"
              value={perPage}
              aria-label="Rows per page"
              onChange={(event) => onPerPageChange(Number(event.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav className="pagination" aria-label="Pagination">
        <button
          type="button"
          className="pagination__btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </button>

        {pages.map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              type="button"
              className={`pagination__btn${page === item ? " pagination__btn--active" : ""}`}
              aria-current={page === item ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="pagination__dots">
              …
            </span>
          )
        )}

        <button
          type="button"
          className="pagination__btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </nav>
    </>
  );
};

export default Pagination;
