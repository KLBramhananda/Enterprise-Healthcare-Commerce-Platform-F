import { useQuery } from "@tanstack/react-query";
import { MockEngagementService } from "@/services";

const engagementService = new MockEngagementService();
const ENGAGEMENT_QK = "engagement";

export function useMembershipStatus() {
  return useQuery({
    queryKey: [ENGAGEMENT_QK, "membership"],
    queryFn: () => engagementService.getMembershipStatus(),
    staleTime: 120_000,
  });
}

export function useMembershipBenefits() {
  return useQuery({
    queryKey: [ENGAGEMENT_QK, "membership", "benefits"],
    queryFn: () => engagementService.getMembershipBenefits(),
    staleTime: 300_000,
  });
}
