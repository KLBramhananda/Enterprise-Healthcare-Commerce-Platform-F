import { useQuery } from "@tanstack/react-query";
import { MockSupportService } from "@/services/supportMock";

const supportService = new MockSupportService();

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
