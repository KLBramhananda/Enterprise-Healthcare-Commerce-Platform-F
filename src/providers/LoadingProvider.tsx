/**
 * Loading Provider
 *
 * Global request/loading state infrastructure. Tracks active API requests
 * so any component can display a global loading indicator without prop-drilling.
 *
 * This is infrastructure for future use — the current UI does not consume it
 * yet, but it's available for any component that needs to react to pending
 * API calls (e.g., a global progress bar).
 */

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { LoadingContext, type LoadingState } from "./loadingContext";

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [activeCount, setActiveCount] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);

  const track = useCallback(() => {
    setTotalRequests((t) => t + 1);
    setActiveCount((c) => c + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      setActiveCount((c) => Math.max(0, c - 1));
    };
  }, []);

  const value = useMemo<LoadingState>(
    () => ({
      activeCount: activeCount > 0,
      totalRequests,
      track,
    }),
    [activeCount, totalRequests, track],
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}
