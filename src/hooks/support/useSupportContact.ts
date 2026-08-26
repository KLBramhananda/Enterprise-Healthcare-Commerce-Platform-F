import { useQuery, useMutation } from "@tanstack/react-query";
import { MockSupportService } from "@/services/supportMock";
import type { ContactFormData } from "@/types/support";

const supportService = new MockSupportService();

export function useSupportChannels() {
  return useQuery({
    queryKey: ["support", "channels"],
    queryFn: () => supportService.getSupportChannels(),
  });
}

export function useSubmitContactForm() {
  return useMutation({
    mutationFn: (data: ContactFormData) => supportService.submitContactForm(data),
  });
}
