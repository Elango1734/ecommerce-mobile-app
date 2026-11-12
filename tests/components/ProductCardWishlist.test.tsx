import React from 'react';
import { Alert } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ProductSummaryDto } from '@shopsphere/api-client';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { EviraProductCard } from '@/components/evira/ProductCard';
import { useAuthStore } from '@/stores/authStore';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));

const mockToggleWishlist = jest.fn(async () => []);
jest.mock('@/api/client', () => ({
  api: {
    discovery: {
      getWishlist: jest.fn(async () => []),
      toggleWishlist: (...args: unknown[]) => mockToggleWishlist(...(args as [])),
      getRecentlyViewed: jest.fn(async () => [])
    }
  }
}));

const PRODUCT: ProductSummaryDto = {
  id: 'p1',
  name: 'Match Soccer Ball',
  slug: 'match-soccer-ball',
  sellerId: 's1',
  categoryId: 'c1',
  brandId: null,
  images: [],
  priceRange: { minAmountMinor: 1999, maxAmountMinor: 1999, currency: 'USD' },
  ratingAverage: 0,
  ratingCount: 0,
  hasAvailableStock: true
};

function renderCard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <EviraProductCard product={PRODUCT} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe('EviraProductCard wishlist heart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  it('prompts a signed-out shopper to sign in instead of failing silently', () => {
    useAuthStore.setState({ user: null, accessToken: null });
    renderCard();

    fireEvent.press(screen.getByLabelText('Add to wishlist'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Sign in to save items',
      expect.stringContaining('signed in'),
      expect.arrayContaining([expect.objectContaining({ text: 'Sign in' })])
    );
    // The signed-out tap must never reach the auth-only endpoint.
    expect(mockToggleWishlist).not.toHaveBeenCalled();
  });

  it('offers a sign-in route out of the prompt', () => {
    useAuthStore.setState({ user: null, accessToken: null });
    renderCard();

    fireEvent.press(screen.getByLabelText('Add to wishlist'));
    const buttons = (Alert.alert as jest.Mock).mock.calls[0]![2] as Array<{ text: string; onPress?: () => void }>;
    buttons.find((b) => b.text === 'Sign in')?.onPress?.();

    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });

  // The mutation's onMutate awaits a query cancellation, so the request leaves on
  // a later microtask than the press — assert with waitFor, not synchronously.
  it('calls the API for a signed-in shopper', async () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'a@b.c', displayName: 'A', roles: ['customer'] },
      accessToken: 'token'
    });
    renderCard();

    fireEvent.press(screen.getByLabelText('Add to wishlist'));

    await waitFor(() => expect(mockToggleWishlist).toHaveBeenCalledWith('p1', undefined));
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});
