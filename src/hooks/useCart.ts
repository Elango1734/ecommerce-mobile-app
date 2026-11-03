import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';

export function useCart() {
  return useQuery({ queryKey: queryKeys.cart, queryFn: () => api.cart.getCart() });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string; quantity: number }) => api.cart.addItem(variantId, quantity),
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart)
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string; quantity: number }) => api.cart.updateItem(variantId, quantity),
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart)
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variantId: string) => api.cart.removeItem(variantId),
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart)
  });
}
