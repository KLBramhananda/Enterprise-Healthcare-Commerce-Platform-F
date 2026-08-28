/**
 * useAccount
 *
 * Hook for account management operations.
 * Wraps the account service with React Query for caching and mutations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services/factory";
import { useAccountStore } from "@/store/accountStore";
import type { AccountPreferences } from "@/types/account";

const accountService = services.account;
const PREFERENCES_QUERY_KEY = ["account", "preferences"];
const COMPLETION_QUERY_KEY = ["account", "completion"];
const PROFILE_QUERY_KEY = ["account", "profile"];

export function useAccountPreferences() {
  return useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: () => accountService.getPreferences(),
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const storeSetPreferences = useAccountStore((s) => s.setPreferences);

  return useMutation({
    mutationFn: (prefs: Partial<AccountPreferences>) => accountService.updatePreferences(prefs),
    onSuccess: (data) => {
      storeSetPreferences(data);
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, data);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { fullName?: string; phone?: string }) => accountService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}

export function useAccountCompletion() {
  return useQuery({
    queryKey: COMPLETION_QUERY_KEY,
    queryFn: () => accountService.getAccountCompletion(),
  });
}
