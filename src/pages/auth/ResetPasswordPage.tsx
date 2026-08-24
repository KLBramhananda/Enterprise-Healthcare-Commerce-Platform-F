/**
 * ResetPasswordPage
 *
 * Set a new password after OTP verification.
 */

import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle } from "lucide-react";
import { Button, Card, CardBody } from "@/components/ui";
import PasswordInput from "@/components/ui/PasswordInput";
import { useResetPassword } from "@/hooks/auth";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/hooks/auth/schemas";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { reset, isPending, error, clearError, isSuccess } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        window.location.href = "/auth/login?reset=true";
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const onSubmit = (data: ResetPasswordFormData) => {
    clearError();
    reset(data, token);
  };

  if (isSuccess) {
    return (
      <Card>
        <CardBody className="p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-success-600">
            <CheckCircle size={28} />
          </div>
          <h1 className="text-xl font-bold text-surface-900">Password reset successfully</h1>
          <p className="mt-2 text-sm text-surface-500">
            Your password has been updated. Redirecting to sign in...
          </p>
          <Link to="/auth/login?reset=true" className="mt-6 inline-block">
            <Button fullWidth>Sign in now</Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-surface-900">Set new password</h1>
          <p className="mt-1 text-sm text-surface-500">
            Choose a strong password for your account
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-danger-100 bg-danger-50 p-3 text-sm text-danger-800">
            {error}
          </div>
        )}

        {!token && (
          <div className="mb-4 rounded-lg border border-warning-100 bg-warning-50 p-3 text-sm text-warning-800">
            Invalid or missing reset token. Please request a new code.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <PasswordInput
            label="New password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <PasswordInput
            label="Confirm new password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" fullWidth disabled={isPending || !token}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Resetting password...
              </span>
            ) : (
              "Reset password"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          <Link
            to="/auth/login"
            className="font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            Back to sign in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
