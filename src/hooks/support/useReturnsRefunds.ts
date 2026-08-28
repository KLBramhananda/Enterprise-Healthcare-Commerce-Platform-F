import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services/factory";
import type { ReturnRequestFormData } from "@/types/support";

const supportService = services.support;

export function useReturnPolicy() {
  return useQuery({
    queryKey: ["support", "return-policy"],
    queryFn: () => supportService.getReturnPolicy(),
  });
}

export function useRefundPolicy() {
  return useQuery({
    queryKey: ["support", "refund-policy"],
    queryFn: () => supportService.getRefundPolicy(),
  });
}

export function useReturnEligibility(orderId: string | null) {
  return useQuery({
    queryKey: ["support", "return-eligibility", orderId],
    queryFn: () => supportService.checkReturnEligibility(orderId!),
    enabled: !!orderId,
  });
}

export function useSubmitReturnRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReturnRequestFormData) => supportService.submitReturnRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "returns"] });
    },
  });
}

export function useReturnRequests() {
  return useQuery({
    queryKey: ["support", "returns"],
    queryFn: () => supportService.getReturnRequests(),
  });
}

export function useRefundHistory() {
  return useQuery({
    queryKey: ["support", "refunds"],
    queryFn: () => supportService.getRefundHistory(),
  });
}
