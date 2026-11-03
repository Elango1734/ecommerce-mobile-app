import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';
import type { CreateReviewPayload } from '@shopsphere/api-client';

/** `productSlug` is optional because some callers (e.g. order history) only know the order/variant, not the product's slug. */
export function useCreateReview(productSlug?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => api.reviews.createReview(payload),
    onSuccess: async () => {
      if (!productSlug) return;
      await queryClient.invalidateQueries({ queryKey: queryKeys.productReviews(productSlug) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.product(productSlug) });
    }
  });
}
