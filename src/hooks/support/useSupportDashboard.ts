import { useQuery } from "@tanstack/react-query";
import { services } from "@/services/factory";

const supportService = services.support;

export function useSupportStats() {
  return useQuery({
    queryKey: ["support", "stats"],
    queryFn: () => supportService.getSupportStats(),
  });
}

export function useSupportActivity() {
  return useQuery({
    queryKey: ["support", "activity"],
    queryFn: () => supportService.getSupportActivity(),
  });
}
