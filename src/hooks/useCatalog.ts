import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';
import type { ProductListQuery } from '@shopsphere/api-client';

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: () => api.catalog.listCategories() });
}

export function useBrands() {
  return useQuery({ queryKey: queryKeys.brands, queryFn: () => api.catalog.listBrands() });
}

/** Campaign discounts currently running — see GET /promotions. */
export function usePromotions() {
  return useQuery({ queryKey: queryKeys.promotions, queryFn: () => api.catalog.listPromotions() });
}

export function useProducts(query: ProductListQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.products(query),
    queryFn: () => api.catalog.listProducts(query),
    placeholderData: (previous) => previous,
    enabled: options?.enabled ?? true
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.product(slug ?? ''),
    queryFn: () => api.catalog.getProduct(slug!),
    enabled: Boolean(slug)
  });
}

export function useProductReviews(slug: string | undefined, page = 1) {
  return useQuery({
    queryKey: [...queryKeys.productReviews(slug ?? ''), page],
    queryFn: () => api.catalog.listProductReviews(slug!, page),
    enabled: Boolean(slug)
  });
}

export function useProductQuestions(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.productQuestions(slug ?? ''),
    queryFn: () => api.catalog.listProductQuestions(slug!),
    enabled: Boolean(slug)
  });
}

export function useCompareProducts(ids: string[]) {
  return useQuery({
    queryKey: ['compare', ids],
    queryFn: () => api.catalog.compareProducts(ids),
    enabled: ids.length >= 2
  });
}
