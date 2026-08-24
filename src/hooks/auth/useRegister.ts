/**
 * useRegister
 *
 * Register action hook. On success, navigates to login with a success flag.
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { MockAuthService } from "@/services";
import type { RegisterFormData } from "./schemas";

const authService = new MockAuthService();

export function useRegister() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const setLoading = useAuthStore((s) => s.setLoading);
  const navigate = useNavigate();

  const register = useCallback(
    async (data: RegisterFormData) => {
      setError(null);
      setIsPending(true);
      setLoading(true);

      try {
        await authService.register(data);
        navigate("/auth/login?registered=true", { replace: true });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(message);
      } finally {
        setIsPending(false);
        setLoading(false);
      }
    },
    [setLoading, navigate],
  );

  const clearError = useCallback(() => setError(null), []);

  return { register, isPending, error, clearError };
}
