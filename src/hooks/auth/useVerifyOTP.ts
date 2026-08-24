/**
 * useVerifyOTP
 *
 * OTP verification action hook. On success, returns a reset token for the next step.
 */

import { useState, useCallback } from "react";
import { MockAuthService } from "@/services";
import type { VerifyOTPFormData } from "./schemas";

const authService = new MockAuthService();

export function useVerifyOTP() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

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

  const clearError = useCallback(() => setError(null), []);

  return { verify, isPending, error, clearError };
}
