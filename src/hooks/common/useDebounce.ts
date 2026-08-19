/**
 * useDebounce
 *
 * Delays updating a value until the user stops typing.
 */

import { useEffect, useState } from "react";
import { DEBOUNCE_DELAY } from "@/config/constants";

export function useDebounce<T>(value: T, delay = DEBOUNCE_DELAY): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
