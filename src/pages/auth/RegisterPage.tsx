/**
 * RegisterPage
 *
 * Customer registration form with full validation.
 */

import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button, Card, CardBody } from "@/components/ui";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { useRegister } from "@/hooks/auth";
import { registerSchema, type RegisterFormData } from "@/hooks/auth/schemas";

export default function RegisterPage() {
  const { register: registerUser, isPending, error, clearError } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const onSubmit = (data: RegisterFormData) => {
    clearError();
    registerUser(data);
  };

  return (
    <Card>
      <CardBody className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-surface-900">Create your account</h1>
          <p className="mt-1 text-sm text-surface-500">
            Join KeeMeds for fast medicine delivery and health management
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-danger-100 bg-danger-50 p-3 text-sm text-danger-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full name"
            placeholder="John Doe"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register("fullName")}
          />

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Phone number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <PasswordInput
            label="Password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <PasswordInput
            label="Confirm password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" fullWidth disabled={isPending}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          Already have an account?{" "}
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
