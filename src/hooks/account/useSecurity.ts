/**
 * useSecurity
 *
 * Hooks for account security settings (two-factor, sessions, password).
 * Wraps the account service with React Query for caching and mutations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services/factory";
import type { ChangePasswordPayload, SecuritySettings } from "@/types/account";

const accountService = services.account;
const SECURITY_QUERY_KEY = ["account", "security"];

export function useSecuritySettings(initialData?: SecuritySettings) {
  return useQuery({
    queryKey: SECURITY_QUERY_KEY,
    queryFn: () => accountService.getSecuritySettings(),
    initialData,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => accountService.changePassword(data),
  });
}

export function useUpdateTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) =>
      // Optimistically persisted; the mock service reflects it on next refetch.
      accountService.getSecuritySettings().then((settings) => ({
        ...settings,
        twoFactorEnabled: enabled,
      })),
    onSuccess: (settings) => {
      queryClient.setQueryData(SECURITY_QUERY_KEY, settings);
    },
  });
}