/**
 * useAuth
 *
 * Read-only hook for accessing authentication state.
 * Components that only need to check auth status use this hook.
 */

import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  return { user, isAuthenticated, isLoading };
}
