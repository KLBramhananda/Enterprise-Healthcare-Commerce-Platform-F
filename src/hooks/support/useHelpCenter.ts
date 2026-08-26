import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MockSupportService } from "@/services/supportMock";
import type { FAQCategory } from "@/types/support";

const supportService = new MockSupportService();

export function useFAQs(category?: FAQCategory) {
  return useQuery({
    queryKey: ["support", "faqs", category].filter(Boolean),
    queryFn: () => supportService.getFAQs(category),
  });
}

export function useFeaturedFAQs() {
  return useQuery({
    queryKey: ["support", "faqs", "featured"],
    queryFn: () => supportService.getFeaturedFAQs(),
  });
}

export function useFAQSearch(query: string) {
  return useQuery({
    queryKey: ["support", "faqs", "search", query],
    queryFn: () => supportService.searchFAQs(query),
    enabled: query.length >= 2,
  });
}

export function useSubmitFAQFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, helpful }: { id: string; helpful: boolean }) =>
      supportService.submitFAQFeedback(id, helpful),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "faqs"] });
    },
  });
}
