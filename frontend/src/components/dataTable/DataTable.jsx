import Table from "../table/Table";
import SearchInput from "../search/SearchInput";
import Pagination from "../pagination/Pagination";
import EmptyState from "../emptyState/EmptyState";
import TableSkeleton from "../loading/TableSkeleton";
import Button from "../button/Button";
import useTableControls from "../../hooks/useTableControls";
import { PAGE_SIZE } from "../../constants/appConstants";

/**
 * THE table used by every list page in this CMS.
 *
 * Handles: search, sorting, pagination, loading, empty state, custom columns
 * and the View / Edit / Delete action buttons.
 *
 * Props
 *  columns       [{ key, label, sortable?, align?, width?, render? }]
 *  rows          array of records from a service
 *  isLoading     shows shimmer rows
 *  searchFields  which fields the search box looks at, e.g. ["name","sku"]
 *  onView/onEdit/onDelete  omit any of them to hide that button
 *  toolbar       extra filter controls rendered next to the search box
 *  serverSide    set true once the backend supports ?page=&limit=&search=
 */
const DataTable = ({
  columns = [],
  rows = [],
  isLoading = false,
  error = null,
  searchFields = [],
  searchPlaceholder = "Search records",
  emptyTitle = "Nothing here yet",
  emptyMessage = "Records you add will show up in this list.",
  emptyActionLabel,
  onEmptyAction,
  onView,
  onEdit,
  onDelete,
  onRetry,
  toolbar = null,
  pageSize = PAGE_SIZE,
  initialSortKey = "id",
  initialSortDir = "desc",
  serverSide = false,
  rowKey = "id",
}) => {
  const controls = useTableControls({
    rows,
    searchFields,
    initialSortKey,
    initialSortDir,
    pageSize,
    serverSide,
  });

  const hasActions = Boolean(onView || onEdit || onDelete);

  const allColumns = hasActions
    ? [
        ...columns,
        {
          key: "__actions",
          label: "Actions",
          align: "right",
          width: 130,
          sortable: false,
          render: (_value, row) => (
            <div className="table__actions">
              {onView && (
                <button
                  type="button"
                  className="icon-btn"
                  title="View details"
                  aria-label="View details"
                  onClick={(event) => {
                    event.stopPropagation();
                    onView(row);
                  }}
                >
                  ⊙
                </button>
              )}
              {onEdit && (
                <button
                  type="button"
                  className="icon-btn"
                  title="Edit"
                  aria-label="Edit"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(row);
                  }}
                >
                  ✎
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="icon-btn icon-btn--danger"
                  title="Delete"
                  aria-label="Delete"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(row);
                  }}
                >
                  ⌫
                </button>
              )}
            </div>
          ),
        },
      ]
    : columns;

  const isSearching = Boolean(controls.searchTerm);
  const showEmpty = !isLoading && !error && controls.total === 0;

  return (
    <div>
      <div className="table__toolbar">
        <SearchInput
          value={controls.searchTerm}
          onChange={controls.setSearchTerm}
          placeholder={searchPlaceholder}
        />
        {toolbar && <div className="u-flex u-gap-2 u-wrap">{toolbar}</div>}
      </div>

      {error ? (
        <EmptyState
          icon="!"
          title="Couldn't load this list"
          message={error}
          actionLabel={onRetry ? "Try again" : undefined}
          onAction={onRetry}
        />
      ) : showEmpty ? (
        <EmptyState
          title={isSearching ? "No matches" : emptyTitle}
          message={
            isSearching
              ? `Nothing matched "${controls.searchTerm}". Try a shorter term.`
              : emptyMessage
          }
          actionLabel={isSearching ? "Clear search" : emptyActionLabel}
          onAction={isSearching ? () => controls.setSearchTerm("") : onEmptyAction}
        />
      ) : isLoading ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {allColumns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <TableSkeleton rows={6} columns={allColumns.length} />
          </table>
        </div>
      ) : (
        <Table
          columns={allColumns}
          rows={controls.visibleRows}
          sortKey={controls.sortKey}
          sortDir={controls.sortDir}
          onSort={controls.toggleSort}
          rowKey={rowKey}
        />
      )}

      {!isLoading && !error && controls.total > 0 && (
        <div className="table__footer">
          <Pagination
            page={controls.page}
            totalPages={controls.totalPages}
            total={controls.total}
            perPage={controls.perPage}
            onPageChange={controls.setPage}
            onPerPageChange={controls.setPerPage}
          />
        </div>
      )}

      {/* Kept for parity with server-side mode: the parent can pass onRetry. */}
      {!isLoading && error && onRetry && (
        <div className="u-center u-mt-4">
          <Button variant="secondary" onClick={onRetry}>
            Reload
          </Button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
