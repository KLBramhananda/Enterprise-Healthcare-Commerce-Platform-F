/**
 * Shared React Query client
 *
 * A single QueryClient for the whole app, owned by this module instead of
 * being created inline in AppProvider. Non-React modules (the cart/wishlist
 * Zustand stores and the shopping sync provider) need to read and write the
 * cache (setQueryData / invalidateQueries / removeQueries) outside of
 * components, so keeping the instance here avoids provider→store import
 * cycles and guarantees every consumer shares the same cache.
 */

import { QueryClient } from "@tanstack/react-query";
import { QUERY_STALE_TIME, QUERY_RETRY_COUNT } from "@/config/constants";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: QUERY_RETRY_COUNT,
      staleTime: QUERY_STALE_TIME,
      refetchOnWindowFocus: false,
    },
  },
});
