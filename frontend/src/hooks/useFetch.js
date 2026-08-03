import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Runs an async function on mount and exposes { data, isLoading, error, reload }.
 * Used by pages that only read (dashboard, detail panels, dropdown lookups).
 *
 * @param {Function} fetcher   async function returning the data
 * @param {Array} deps         re-runs when these change
 * @param {*} initialData      value before the first response lands
 */
const useFetch = (fetcher, deps = [], initialData = null) => {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (isMounted.current) setData(result);
      return result;
    } catch (caught) {
      // The axios interceptor already showed the toast; keep the message
      // so the page can render an inline error state.
      if (isMounted.current) setError(caught?.message || "Request failed");
      return null;
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, reload: load, setData };
};

export default useFetch;
