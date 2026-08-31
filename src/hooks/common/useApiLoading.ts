/**
 * API Loading Hook
 *
 * Utility hook for tracking individual request loading state.
 * Integrates with the LoadingProvider for global tracking.
 *
 * Usage:
 *   const { isLoading, execute } = useApiLoading();
 *   const data = await execute(() => catalogService.getProducts(query));
 */

import { useCallback, useRef, useState } from "react";

interface UseApiLoadingReturn {
  /** Whether the tracked request is currently in flight. */
  isLoading: boolean;
  /** The last error from execute(), or null. */
  error: unknown;
  /** Execute an async operation with automatic loading state tracking. */
  execute: <T>(fn: () => Promise<T>) => Promise<T>;
  /** Manually reset error state. */
  clearError: () => void;
}

export function useApiLoading(): UseApiLoadingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (mountedRef.current) setIsLoading(false);
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setIsLoading(false);
      }
      throw err;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { isLoading, error, execute, clearError };
}
