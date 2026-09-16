import { useState } from "react";
import {
  Lock,
  Shield,
  Smartphone,
  Monitor,
  Globe,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import PasswordInput from "@/components/ui/PasswordInput";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import {
  useSecuritySettings,
  useChangePassword,
  useUpdateTwoFactor,
} from "@/hooks/account";
import { useToast } from "@/providers/ToastProvider";
import { formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "A number", test: (v: string) => /\d/.test(v) },
  { label: "A special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
  { label: "An uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
];

export default function AccountSecurityPage() {
  usePageTitle("Security");

  const { addToast } = useToast();
  const { data: security, isLoading, isError, refetch } = useSecuritySettings();
  const changePassword = useChangePassword();
  const updateTwoFactor = useUpdateTwoFactor();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

  const validate = () => {
    const errors: { current?: string; new?: string; confirm?: string } = {};
    if (!currentPassword) errors.current = "Enter your current password.";
    if (!newPassword) {
      errors.new = "Enter a new password.";
    } else if (PASSWORD_RULES.some((r) => !r.test(newPassword))) {
      errors.new = "Password does not meet the requirements below.";
    }
    if (confirmPassword !== newPassword) errors.confirm = "Passwords do not match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = () => {
    if (!validate()) return;
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          addToast("Password updated successfully.", "success");
        },
        onError: (error) => {
          addToast(
            error instanceof Error ? error.message : "Failed to update password. Please try again.",
            "error",
          );
        },
      },
    );
  };

  const handleToggleTwoFactor = () => {
    updateTwoFactor.mutate(!security?.twoFactorEnabled, {
      onSuccess: (updated) => {
        addToast(
          updated.twoFactorEnabled
            ? "Two-factor authentication enabled."
            : "Two-factor authentication disabled.",
          "success",
        );
      },
      onError: () => addToast("Failed to update security settings. Please try again.", "error"),
    });
  };

  const passwordValid = PASSWORD_RULES.every((r) => r.test(newPassword));

  return (
    <div className="min-w-0 flex-1">
      <Breadcrumb
        className="py-2"
        items={[
          { label: "Home", path: "/" },
          { label: "My Account", path: "/account/dashboard" },
          { label: "Security" },
        ]}
      />

      <header className="mt-2 border-b border-surface-200 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
          Security
        </h1>
      </header>

      {isLoading ? (
        <div className="mt-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-surface-100" />
          ))}
        </div>
      ) : isError || !security ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-danger-200 bg-danger-50 p-12 text-center">
          <AlertCircle size={40} className="text-danger-400" />
          <h2 className="mt-4 text-lg font-semibold text-surface-900">
            Failed to load security settings
          </h2>
          <p className="mt-1 max-w-sm text-sm text-surface-500">
            We couldn't fetch your security settings. Please check your connection and try again.
          </p>
          <Button onClick={() => refetch()} className="mt-5">
            <RefreshCw size={16} className="mr-2" />
            Try again
          </Button>
        </div>
      ) : (
        <div className="mt-6 max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-brand-600" />
                <h2 className="text-base font-semibold text-surface-900">Change Password</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <PasswordInput
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  error={fieldErrors.current}
                />
                <PasswordInput
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, new: undefined }));
                  }}
                  placeholder="Enter a new password"
                  error={fieldErrors.new}
                />
                <PasswordInput
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
                  }}
                  placeholder="Re-enter the new password"
                  error={fieldErrors.confirm}
                />

                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = newPassword.length > 0 && rule.test(newPassword);
                    return (
                      <span
                        key={rule.label}
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-medium",
                          newPassword.length === 0
                            ? "text-surface-400"
                            : passed
                              ? "text-success-600"
                              : "text-surface-500",
                        )}
                      >
                        {passed ? (
                          <CheckCircle size={12} className="text-success-600" />
                        ) : (
                          <AlertCircle size={12} className="text-surface-400" />
                        )}
                        {rule.label}
                      </span>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={handleChangePassword}
                    loading={changePassword.isPending}
                    disabled={newPassword.length > 0 && !passwordValid}
                  >
                    {changePassword.isPending ? "Updating..." : "Update Password"}
                  </Button>
                  {security.lastPasswordChangedAt && (
                    <span className="text-xs text-surface-400">
                      Last changed {formatDate(security.lastPasswordChangedAt)}
                    </span>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-brand-600" />
                <h2 className="text-base font-semibold text-surface-900">
                  Two-Factor Authentication
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <Smartphone size={20} className="mt-0.5 shrink-0 text-surface-400" />
                  <div>
                    <p className="text-sm font-medium text-surface-900">
                      {security.twoFactorEnabled ? "Enabled" : "Not enabled"}
                    </p>
                    <p className="mt-0.5 text-sm text-surface-500">
                      Add an extra layer of security to your account. When enabled,
                      you'll be asked for a one-time code on sign-in.
                    </p>
                  </div>
                </div>
                <Button
                  variant={security.twoFactorEnabled ? "secondary" : "primary"}
                  onClick={handleToggleTwoFactor}
                  loading={updateTwoFactor.isPending}
                  className="shrink-0 self-start sm:self-auto"
                >
                  {security.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Monitor size={18} className="text-brand-600" />
                <h2 className="text-base font-semibold text-surface-900">
                  Active Sessions
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {security.activeSessions.length === 0 ? (
                  <p className="py-4 text-center text-sm text-surface-500">
                    No active sessions found.
                  </p>
                ) : (
                  security.activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-4 rounded-xl border border-surface-200 p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-100">
                        <Globe size={18} className="text-surface-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-surface-900">
                            {session.device}
                          </p>
                          {session.isCurrent && (
                            <Badge variant="success">Current</Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-surface-500">
                          {session.platform} &middot; {session.location}
                        </p>
                        <p className="text-xs text-surface-400">
                          Last active {formatDate(session.lastActiveAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}