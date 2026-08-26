import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MockEngagementService } from "@/services";

const engagementService = new MockEngagementService();
const ENGAGEMENT_QK = "engagement";

export function useLoyaltyAccount() {
  return useQuery({
    queryKey: [ENGAGEMENT_QK, "loyalty", "account"],
    queryFn: () => engagementService.getLoyaltyAccount(),
    staleTime: 60_000,
  });
}

export function useLoyaltyHistory() {
  return useQuery({
    queryKey: [ENGAGEMENT_QK, "loyalty", "history"],
    queryFn: () => engagementService.getLoyaltyHistory(),
    staleTime: 60_000,
  });
}

export function useLoyaltyTiers() {
  return useQuery({
    queryKey: [ENGAGEMENT_QK, "loyalty", "tiers"],
    queryFn: () => engagementService.getLoyaltyTiers(),
    staleTime: 300_000,
  });
}

export function useRedeemPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (points: number) => engagementService.redeemPoints(points),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: [ENGAGEMENT_QK, "loyalty"] });
    },
  });
}
