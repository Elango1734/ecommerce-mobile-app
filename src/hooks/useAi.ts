import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';

export function useAiHistory(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.aiHistory(conversationId ?? ''),
    queryFn: () => api.ai.getHistory(conversationId!),
    enabled: Boolean(conversationId)
  });
}

export function useAiDiscovery() {
  return useMutation({ mutationFn: ({ message, conversationId }: { message: string; conversationId?: string }) => api.ai.discovery(message, conversationId) });
}

export function useAiCompare() {
  return useMutation({ mutationFn: ({ productIds, conversationId }: { productIds: string[]; conversationId?: string }) => api.ai.compare(productIds, conversationId) });
}

export function useAiSupport() {
  return useMutation({
    mutationFn: ({ message, orderId, conversationId }: { message: string; orderId?: string; conversationId?: string }) =>
      api.ai.support(message, orderId, conversationId)
  });
}

export function useRelatedProducts(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.aiRelatedProducts(slug ?? ''),
    queryFn: () => api.ai.getRelatedProducts(slug!),
    enabled: Boolean(slug)
  });
}

export function useReviewSummary(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.aiReviewSummary(slug ?? ''),
    queryFn: () => api.ai.getReviewSummary(slug!),
    enabled: Boolean(slug)
  });
}

export function useDeleteAiHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => api.ai.deleteHistory(conversationId),
    onSuccess: (_, conversationId) => queryClient.removeQueries({ queryKey: queryKeys.aiHistory(conversationId) })
  });
}
