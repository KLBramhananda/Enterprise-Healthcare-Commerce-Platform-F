import { useQuery, useMutation } from "@tanstack/react-query";
import { services } from "@/services/factory";
import type { ContactFormData } from "@/types/support";

const supportService = services.support;

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
