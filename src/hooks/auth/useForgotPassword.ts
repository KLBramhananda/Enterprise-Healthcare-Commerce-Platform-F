/**
 * useForgotPassword
 *
 * Forgot password action hook. On success, sets isSuccess for UI feedback.
 */

import { useState, useCallback } from "react";
import { services } from "@/services/factory";
import type { ForgotPasswordFormData } from "./schemas";

const authService = services.auth;

export function useForgotPassword() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const submit = useCallback(async (data: ForgotPasswordFormData) => {
    setError(null);
    setIsPending(true);

    try {
      await authService.forgotPassword(data);
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

  return { submit, isPending, error, clearError, isSuccess };
}
