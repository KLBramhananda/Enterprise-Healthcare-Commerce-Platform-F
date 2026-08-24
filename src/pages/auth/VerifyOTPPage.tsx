/**
 * VerifyOTPPage
 *
 * Enter 6-digit verification code for password reset.
 */

import { useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, KeyRound } from "lucide-react";
import { Button, Card, CardBody } from "@/components/ui";
import Input from "@/components/ui/Input";
import { useVerifyOTP } from "@/hooks/auth";
import { verifyOTPSchema, type VerifyOTPFormData } from "@/hooks/auth/schemas";

export default function VerifyOTPPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const navigate = useNavigate();
  const { verify, isPending, error, clearError } = useVerifyOTP();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOTPFormData>({
    resolver: zodResolver(verifyOTPSchema),
    mode: "onBlur",
  });

  const onSubmit = useCallback(
    async (data: VerifyOTPFormData) => {
      clearError();
      const token = await verify(data, email);
      if (token) {
        navigate(`/auth/reset-password?token=${encodeURIComponent(token)}`, { replace: true });
      }
    },
    [clearError, verify, email, navigate],
  );

  return (
    <Card>
      <CardBody className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <KeyRound size={28} />
          </div>
          <h1 className="text-xl font-bold text-surface-900">Enter verification code</h1>
          <p className="mt-1 text-sm text-surface-500">
            {email ? (
              <>
                We sent a 6-digit code to{" "}
                <span className="font-medium text-surface-700">{email}</span>
              </>
            ) : (
              "Enter the 6-digit code sent to your email"
            )}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-danger-100 bg-danger-50 p-3 text-sm text-danger-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Verification code"
            placeholder="000000"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            className="text-center text-lg tracking-[0.3em]"
            error={errors.code?.message}
            {...register("code")}
          />

          <Button type="submit" fullWidth disabled={isPending}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Verifying...
              </span>
            ) : (
              "Verify code"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          <Link
            to="/auth/forgot-password"
            className="font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            Didn&apos;t receive a code? Try again
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
