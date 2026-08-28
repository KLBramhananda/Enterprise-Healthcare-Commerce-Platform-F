import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services/factory";
import type { OfferStatus } from "@/types/engagement";

const engagementService = services.engagement;
const ENGAGEMENT_QK = "engagement";

export function useOffers(status?: OfferStatus) {
  return useQuery({
    queryKey: [ENGAGEMENT_QK, "offers", status],
    queryFn: () => engagementService.getOffers(status),
    staleTime: 120_000,
  });
}

export function useSaveOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => engagementService.toggleSaveOffer(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [ENGAGEMENT_QK, "offers"] });
      const previous = queryClient.getQueriesData({ queryKey: [ENGAGEMENT_QK, "offers"] });
      queryClient.setQueriesData({ queryKey: [ENGAGEMENT_QK, "offers"] }, (old: Awaited<ReturnType<typeof engagementService.getOffers>> | undefined) => {
        if (!old) return old;
        return old.map((o) => (o.id === id ? { ...o, saved: !o.saved } : o));
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
      void queryClient.invalidateQueries({ queryKey: [ENGAGEMENT_QK, "offers"] });
    },
  });
}
