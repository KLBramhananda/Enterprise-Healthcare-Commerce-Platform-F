/**
 * useAuth
 *
 * Read-only hook for accessing authentication state.
 * Components that only need to check auth status use this hook.
 */

import { useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { services } from "@/services/factory";

const authService = services.auth;

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const logout = useCallback(async () => {
    await authService.logout();
    clearAuth();
  }, [clearAuth]);

  return { user, isAuthenticated, isLoading, logout };
}
