/**
 * ForgotPasswordPage
 *
 * Request a password reset code via email.
 */

import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { Button, Card, CardBody } from "@/components/ui";
import Input from "@/components/ui/Input";
import { useForgotPassword } from "@/hooks/auth";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/hooks/auth/schemas";

export default function ForgotPasswordPage() {
  const { submit, isPending, error, clearError, isSuccess } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    clearError();
    submit(data);
  };

  if (isSuccess) {
    return (
      <Card>
        <CardBody className="p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <MailCheck size={28} />
          </div>
          <h1 className="text-xl font-bold text-surface-900">Check your email</h1>
          <p className="mt-2 text-sm text-surface-500">
            We&apos;ve sent a 6-digit verification code to{" "}
            <span className="font-medium text-surface-700">{getValues("email")}</span>.
            Enter it on the next screen to reset your password.
          </p>
          <Link
            to={`/auth/verify-otp?email=${encodeURIComponent(getValues("email"))}`}
            className="mt-6 inline-block"
          >
            <Button fullWidth>Continue to verification</Button>
          </Link>
          <p className="mt-4 text-sm text-surface-500">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={() => {
                clearError();
                submit({ email: getValues("email") });
              }}
              className="font-medium text-brand-600 transition-colors hover:text-brand-700"
            >
              Resend
            </button>
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-surface-900">Forgot your password?</h1>
          <p className="mt-1 text-sm text-surface-500">
            Enter your email and we&apos;ll send you a verification code
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-danger-100 bg-danger-50 p-3 text-sm text-danger-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Button type="submit" fullWidth disabled={isPending}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Sending code...
              </span>
            ) : (
              "Send verification code"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          Remember your password?{" "}
          <Link
            to="/auth/login"
            className="font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            Sign in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
