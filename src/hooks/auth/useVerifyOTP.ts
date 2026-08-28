/**
 * useVerifyOTP
 *
 * OTP verification action hook. On success, returns a reset token for the next step.
 */

import { useState, useCallback } from "react";
import { services } from "@/services/factory";
import type { VerifyOTPFormData } from "./schemas";

const authService = services.auth;

export function useVerifyOTP() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const verify = useCallback(async (data: VerifyOTPFormData, email: string) => {
    setError(null);
    setIsPending(true);

    try {
      const result = await authService.verifyOTP({ ...data, email });
      return result.token;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      return null;
    } finally {
      setIsPending(false);
    }
  }, []);

  const resend = useCallback(async (email: string) => {
    setError(null);
    setIsResending(true);

    try {
      await authService.forgotPassword({ email });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsResending(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { verify, resend, isPending, isResending, error, clearError };
}
