/**
 * useLogin
 *
 * Login action hook. Orchestrates auth service call, store update, and navigation.
 * On success, redirects to the returnPath saved by ProtectedRoute (or "/" as default).
 */

import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { services } from "@/services/factory";
import type { LoginFormData } from "./schemas";

const authService = services.auth;

export function useLogin() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setLoading = useAuthStore((s) => s.setLoading);
  const navigate = useNavigate();
  const location = useLocation();

  const returnPath = (location.state as { returnPath?: string } | null)?.returnPath ?? "/";

  const login = useCallback(
    async (data: LoginFormData) => {
      setError(null);
      setIsPending(true);
      setLoading(true);

      try {
        const response = await authService.login(data);
        setAuth(response.user, response.tokens);
        navigate(returnPath, { replace: true });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(message);
      } finally {
        setIsPending(false);
        setLoading(false);
      }
    },
    [setAuth, setLoading, navigate, returnPath],
  );

  const clearError = useCallback(() => setError(null), []);

  return { login, isPending, error, clearError };
}
