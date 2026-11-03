import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';

export function useWishlist() {
  return useQuery({ queryKey: queryKeys.wishlist, queryFn: () => api.discovery.getWishlist() });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId?: string }) =>
      api.discovery.toggleWishlist(productId, variantId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.wishlist })
  });
}

export function useRecentlyViewed() {
  return useQuery({ queryKey: queryKeys.recentlyViewed, queryFn: () => api.discovery.getRecentlyViewed() });
}
