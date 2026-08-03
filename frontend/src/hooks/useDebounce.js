import { useEffect, useState } from "react";

/**
 * Delays a fast-changing value (a search box) so we don't re-filter on
 * every keystroke.
 */
const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
