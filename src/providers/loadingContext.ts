/**
 * Global Loading Hooks
 *
 * Hooks to consume the LoadingProvider context. Located in this file so
 * LoadingProvider.tsx only exports components (required by Fast Refresh).
 */

import { createContext, useContext } from "react";

export interface LoadingState {
  /** Whether there are any active (in-flight) requests. */
  activeCount: boolean;
  /** Total requests tracked (for analytics/debugging). */
  totalRequests: number;
  /** Register a new in-flight request. Returns a release function. */
  track: () => () => void;
}

export const LoadingContext = createContext<LoadingState | null>(null);

export function useGlobalLoading(): LoadingState {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useGlobalLoading must be used within <LoadingProvider>");
  return ctx;
}

/**
 * Convenience hook: returns true when any API request is in flight.
 * Suitable for showing skeleton loaders or disabling submit buttons.
 */
export function useIsApiLoading(): boolean {
  const { activeCount } = useGlobalLoading();
  return activeCount;
}
