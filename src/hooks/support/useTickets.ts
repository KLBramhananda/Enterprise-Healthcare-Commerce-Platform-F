import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services/factory";
import type { TicketFilters, TicketFormData, TicketStatus } from "@/types/support";

const supportService = services.support;

export function useTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: ["support", "tickets", filters],
    queryFn: () => supportService.getTickets(filters),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ["support", "ticket", id],
    queryFn: () => supportService.getTicket(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TicketFormData) => supportService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
    },
  });
}

export function useAddTicketMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      message,
      attachments,
    }: {
      ticketId: string;
      message: string;
      attachments?: { name: string; type: string; size: number }[];
    }) => supportService.addTicketMessage(ticketId, message, attachments),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["support", "ticket", variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: TicketStatus }) =>
      supportService.updateTicketStatus(ticketId, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["support", "ticket", variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
    },
  });
}
