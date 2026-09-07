/**
 * App Provider
 *
 * Registers all global application providers.
 */

import { useEffect, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ToastProvider, useToast } from "./ToastProvider";
import { initNotifications } from "@/utils/notifications";
import { ShoppingSyncProvider } from "./ShoppingSyncProvider";

interface AppProviderProps {
  children: ReactNode;
}

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
      <ShoppingSyncProvider>
        <ToastProvider>
          <NotificationsInit />
          {children}
        </ToastProvider>
      </ShoppingSyncProvider>
    </QueryClientProvider>
  );
}
