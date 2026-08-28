/**
 * LoginPage
 *
 * Customer login form with email/password, validation, and error handling.
 */

import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button, Card, CardBody } from "@/components/ui";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { useLogin } from "@/hooks/auth";
import { loginSchema, type LoginFormData } from "@/hooks/auth/schemas";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const registered = searchParams.get("registered") === "true";
  const reset = searchParams.get("reset") === "true";

  const { login, isPending, error, clearError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = (data: LoginFormData) => {
    clearError();
    login(data);
  };

  return (
    <Card>
      <CardBody className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-surface-900">Sign in to your account</h1>
          <p className="mt-1 text-sm text-surface-500">
            Access your orders, prescriptions, and health records
          </p>
        </div>

        {registered && (
          <div className="mb-4 rounded-lg border border-success-100 bg-success-50 p-3 text-sm text-success-800">
            Account created successfully. Please sign in.
          </div>
        )}

        {reset && (
          <div className="mb-4 rounded-lg border border-success-100 bg-success-50 p-3 text-sm text-success-800">
            Password reset successfully. Please sign in with your new password.
          </div>
        )}

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

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex items-center justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth disabled={isPending}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/auth/register"
            className="font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            Create account
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
