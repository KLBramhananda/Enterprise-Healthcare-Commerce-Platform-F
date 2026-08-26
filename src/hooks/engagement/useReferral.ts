import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MockEngagementService } from "@/services";

const engagementService = new MockEngagementService();
const ENGAGEMENT_QK = "engagement";

export function useReferralInfo() {
  return useQuery({
    queryKey: [ENGAGEMENT_QK, "referral"],
    queryFn: () => engagementService.getReferralInfo(),
    staleTime: 60_000,
  });
}

export function useSendReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => engagementService.sendReferralInvite(email),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: [ENGAGEMENT_QK, "referral"] });
    },
  });
}
