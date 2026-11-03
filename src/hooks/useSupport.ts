import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';
import type { CreateTicketPayload } from '@shopsphere/api-client';

export function useSupportTickets() {
  return useQuery({ queryKey: queryKeys.supportTickets, queryFn: () => api.support.listTickets() });
}

export function useSupportTicket(ticketId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.supportTicket(ticketId ?? ''),
    queryFn: () => api.support.getTicket(ticketId!),
    enabled: Boolean(ticketId)
  });
}

export function useSupportMessages(ticketId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.supportMessages(ticketId ?? ''),
    queryFn: () => api.support.listMessages(ticketId!),
    enabled: Boolean(ticketId)
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTicketPayload) => api.support.createTicket(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.supportTickets })
  });
}

export function useAddSupportMessage(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.support.addMessage(ticketId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.supportMessages(ticketId) })
  });
}
