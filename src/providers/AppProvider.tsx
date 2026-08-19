/**
 * App Provider
 *
 * Registers all global application providers.
 */

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QUERY_STALE_TIME, QUERY_RETRY_COUNT } from "@/config/constants";
import { ToastProvider } from "./ToastProvider";

interface AppProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: QUERY_RETRY_COUNT,
      staleTime: QUERY_STALE_TIME,
      refetchOnWindowFocus: false,
    },
  },
});

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
