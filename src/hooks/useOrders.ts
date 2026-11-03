import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';

export function useOrders() {
  return useQuery({ queryKey: queryKeys.orders, queryFn: () => api.orders.listOrders() });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.order(orderId ?? ''),
    queryFn: () => api.orders.getOrder(orderId!),
    enabled: Boolean(orderId)
  });
}

export function useOrderShipments(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orderShipments(orderId ?? ''),
    queryFn: () => api.orders.listOrderShipments(orderId!),
    enabled: Boolean(orderId)
  });
}

export function useCancelOrder(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => api.orders.cancelOrder(orderId, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.order(orderId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    }
  });
}

export function useReturns() {
  return useQuery({ queryKey: queryKeys.returns, queryFn: () => api.orders.listReturns() });
}

export function useCreateReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof api.orders.createReturn>[0]) => api.orders.createReturn(payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.returns });
      await queryClient.invalidateQueries({ queryKey: queryKeys.order(variables.orderId) });
    }
  });
}
