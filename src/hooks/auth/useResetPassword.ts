/**
 * useResetPassword
 *
 * Reset password action hook. On success, sets isSuccess for UI feedback.
 */

import { useState, useCallback } from "react";
import { services } from "@/services/factory";
import type { ResetPasswordFormData } from "./schemas";

const authService = services.auth;

export function useResetPassword() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const reset = useCallback(async (data: ResetPasswordFormData, token: string) => {
    setError(null);
    setIsPending(true);

    try {
      await authService.resetPassword({ ...data, token });
      setIsSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsPending(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { reset, isPending, error, clearError, isSuccess };
}
