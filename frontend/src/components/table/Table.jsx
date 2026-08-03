import { getValue } from "../../utils/helpers";

/**
 * The plain <table> renderer. It knows nothing about loading, paging or
 * searching — DataTable wraps it and adds those.
 *
 * Column shape:
 *   { key, label, sortable?, align?, width?, render?(value, row, index) }
 */
const Table = ({
  columns = [],
  rows = [],
  sortKey,
  sortDir,
  onSort,
  rowKey = "id",
  onRowClick,
}) => (
  <div className="table-wrap">
    <table className="table">
      <thead>
        <tr>
          {columns.map((column) => {
            const isSorted = sortKey === column.key;
            const canSort = column.sortable !== false && onSort && column.key !== "__actions";

            return (
              <th
                key={column.key}
                style={{
                  width: column.width,
                  textAlign: column.align || "left",
                }}
                className={canSort ? "table__sortable" : undefined}
                aria-sort={isSorted ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                onClick={canSort ? () => onSort(column.key) : undefined}
              >
                {column.label}
                {isSorted && (
                  <span className="table__sort-arrow" aria-hidden="true">
                    {sortDir === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            key={getValue(row, rowKey) ?? rowIndex}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            style={onRowClick ? { cursor: "pointer" } : undefined}
          >
            {columns.map((column) => (
              <td
                key={column.key}
                style={{ textAlign: column.align || "left" }}
              >
                {column.render
                  ? column.render(getValue(row, column.key), row, rowIndex)
                  : formatFallback(getValue(row, column.key))}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Anything without a custom renderer still needs to look tidy. */
const formatFallback = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export default Table;
