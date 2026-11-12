import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { WishlistItemDto } from '@shopsphere/api-client';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';
import { useIsAuthenticated } from '@/stores/authStore';

/**
 * `GET /wishlist` is `requireAuth` (discovery.routes.ts), so for a guest this
 * query can only ever 401 — gate it instead of firing a guaranteed failure on
 * every screen that renders a product card.
 */
export function useWishlist() {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: () => api.discovery.getWishlist(),
    enabled: isAuthenticated
  });
}

/**
 * The one place that knows how a heart button behaves.
 *
 * Previously each caller fired the mutation directly: as a guest that hit the
 * same `requireAuth` 401, the error went unhandled and the heart simply never
 * changed — a dead control with no explanation. Now a signed-out tap explains
 * itself and offers the sign-in, and a signed-in tap flips the heart
 * immediately (optimistic) and rolls back with a message if the server refuses.
 */
export function useWishlistToggle() {
  const isAuthenticated = useIsAuthenticated();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { data } = useWishlist();

  const mutation = useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId?: string }) =>
      api.discovery.toggleWishlist(productId, variantId),
    onMutate: async ({ productId, variantId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.wishlist });
      const previous = queryClient.getQueryData<WishlistItemDto[]>(queryKeys.wishlist);
      queryClient.setQueryData<WishlistItemDto[]>(queryKeys.wishlist, (current = []) =>
        current.some((item) => item.productId === productId)
          ? current.filter((item) => item.productId !== productId)
          : [{ productId, variantId: variantId ?? null, addedAt: new Date().toISOString(), product: null }, ...current]
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.wishlist, context.previous);
      Alert.alert('Could not update wishlist', (error as Error).message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.wishlist })
  });

  function isWishlisted(productId: string): boolean {
    return data?.some((item) => item.productId === productId) ?? false;
  }

  function toggle(productId: string, variantId?: string): void {
    if (!isAuthenticated) {
      Alert.alert('Sign in to save items', 'Your wishlist is saved to your account, so you need to be signed in.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Sign in', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }
    mutation.mutate({ productId, variantId });
  }

  return { isWishlisted, toggle, isPending: mutation.isPending };
}

export function useRecentlyViewed() {
  return useQuery({ queryKey: queryKeys.recentlyViewed, queryFn: () => api.discovery.getRecentlyViewed() });
}
