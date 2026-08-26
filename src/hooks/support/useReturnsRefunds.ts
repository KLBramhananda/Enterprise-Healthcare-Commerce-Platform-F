import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MockSupportService } from "@/services/supportMock";
import type { ReturnRequestFormData } from "@/types/support";

const supportService = new MockSupportService();

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
