import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services/factory";
import type { CouponStatus } from "@/types/engagement";

const engagementService = services.engagement;
const ENGAGEMENT_QK = "engagement";

export function useCoupons(status?: CouponStatus) {
  return useQuery({
    queryKey: [ENGAGEMENT_QK, "coupons", status],
    queryFn: () => engagementService.getCoupons(status),
    staleTime: 120_000,
  });
}

export function useSaveCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => engagementService.toggleSaveCoupon(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [ENGAGEMENT_QK, "coupons"] });
      const previous = queryClient.getQueriesData({ queryKey: [ENGAGEMENT_QK, "coupons"] });
      queryClient.setQueriesData({ queryKey: [ENGAGEMENT_QK, "coupons"] }, (old: Awaited<ReturnType<typeof engagementService.getCoupons>> | undefined) => {
        if (!old) return old;
        return old.map((c) => (c.id === id ? { ...c, saved: !c.saved, status: c.saved ? "saved" as const : "available" as const } : c));
      });
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: [ENGAGEMENT_QK, "coupons"] });
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (code: string) => engagementService.validateCoupon(code),
  });
}
