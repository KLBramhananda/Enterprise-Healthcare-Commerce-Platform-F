/**
 * App Provider
 *
 * Registers all global application providers.
 */

import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QUERY_STALE_TIME, QUERY_RETRY_COUNT } from "@/config/constants";
import { ToastProvider, useToast } from "./ToastProvider";
import { initNotifications } from "@/utils/notifications";

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

function NotificationsInit() {
  const { addToast } = useToast();
  useEffect(() => {
    initNotifications(addToast);
  }, [addToast]);
  return null;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <NotificationsInit />
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
}
