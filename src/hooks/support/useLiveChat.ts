import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services/factory";

const supportService = services.support;

export function useChatStatus() {
  return useQuery({
    queryKey: ["support", "chat-status"],
    queryFn: () => supportService.getChatStatus(),
  });
}

export function useStartChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => supportService.startChatSession(),
    onSuccess: (session) => {
      queryClient.setQueryData(["support", "chat-session", session.id], session);
    },
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) =>
      supportService.sendChatMessage(sessionId, content),
    onSuccess: (_msg, variables, context: unknown) => {
      const session = (context as { session?: { id: string } })?.session;
      if (session) {
        queryClient.invalidateQueries({ queryKey: ["support", "chat-session", variables.sessionId] });
      }
    },
  });
}
