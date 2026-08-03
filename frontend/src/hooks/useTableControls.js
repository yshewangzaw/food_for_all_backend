import { useMemo, useState, useEffect } from "react";
import { PAGE_SIZE } from "../constants/appConstants";
import { getValue, matchesSearch } from "../utils/helpers";
import useDebounce from "./useDebounce";

/**
 * Search + sort + paginate a list in the browser.
 *
 * The backend list endpoints accept no query parameters, so this work has to
 * happen client-side for now.
 * TODO(backend): when GET endpoints support ?page=&limit=&search=&sortBy=,
 * pass `serverSide` and let the page pass these values to the service instead.
 */
const useTableControls = ({
  rows = [],
  searchFields = [],
  initialSortKey = "id",
  initialSortDir = "desc",
  pageSize = PAGE_SIZE,
  serverSide = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState(initialSortKey);
  const [sortDir, setSortDir] = useState(initialSortDir);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(pageSize);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // A new search or page size always sends you back to page one.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, perPage]);

  const filtered = useMemo(() => {
    if (serverSide) return rows;
    if (!debouncedSearch) return rows;
    return rows.filter((row) => matchesSearch(row, debouncedSearch, searchFields));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, debouncedSearch, serverSide, JSON.stringify(searchFields)]);

  const sorted = useMemo(() => {
    if (serverSide || !sortKey) return filtered;

    return [...filtered].sort((a, b) => {
      const left = getValue(a, sortKey);
      const right = getValue(b, sortKey);

      if (left === right) return 0;
      if (left === null || left === undefined) return 1;
      if (right === null || right === undefined) return -1;

      // Numbers (including DECIMAL strings) compare numerically.
      const leftNumber = Number(left);
      const rightNumber = Number(right);
      const bothNumeric =
        !Number.isNaN(leftNumber) && !Number.isNaN(rightNumber) && left !== "" && right !== "";

      let comparison;
      if (bothNumeric) {
        comparison = leftNumber - rightNumber;
      } else {
        comparison = String(left).localeCompare(String(right), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sortDir === "asc" ? comparison : -comparison;
    });
  }, [filtered, sortKey, sortDir, serverSide]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    if (serverSide) return sorted;
    const start = (currentPage - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, currentPage, perPage, serverSide]);

  /** Clicking the same header flips direction; a new header starts ascending. */
  const toggleSort = (key) => {
    if (!key) return;
    if (key === sortKey) {
      setSortDir((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return {
    // values
    searchTerm,
    sortKey,
    sortDir,
    page: currentPage,
    perPage,
    total,
    totalPages,
    visibleRows: paginated,
    // setters
    setSearchTerm,
    setPage,
    setPerPage,
    toggleSort,
  };
};

export default useTableControls;
