import { QueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@shopsphere/api-client';

/**
 * A 4xx (except a transient 429) is never worth retrying automatically —
 * it means the request itself was invalid/unauthorized/forbidden, not that
 * the network hiccuped. Only network failures and 5xx get TanStack Query's
 * default retry behavior.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (error instanceof ApiClientError) {
    return error.status >= 500 || error.status === 429;
  }
  return true;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 30_000,
      gcTime: 5 * 60_000
    },
    mutations: {
      retry: false
    }
  }
});

export const queryKeys = {
  categories: ['categories'] as const,
  brands: ['brands'] as const,
  products: (query: object) => ['products', query] as const,
  product: (slug: string) => ['product', slug] as const,
  productReviews: (slug: string) => ['product-reviews', slug] as const,
  productQuestions: (slug: string) => ['product-questions', slug] as const,
  cart: ['cart'] as const,
  wishlist: ['wishlist'] as const,
  recentlyViewed: ['recently-viewed'] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['order', id] as const,
  orderShipments: (id: string) => ['order-shipments', id] as const,
  returns: ['returns'] as const,
  addresses: ['addresses'] as const,
  me: ['me'] as const,
  notifications: (unreadOnly?: boolean) => ['notifications', unreadOnly ?? false] as const,
  supportTickets: ['support-tickets'] as const,
  supportTicket: (id: string) => ['support-ticket', id] as const,
  supportMessages: (id: string) => ['support-messages', id] as const,
  aiHistory: (conversationId: string) => ['ai-history', conversationId] as const,
  aiRelatedProducts: (slug: string) => ['ai-related-products', slug] as const,
  aiReviewSummary: (slug: string) => ['ai-review-summary', slug] as const
};
