import React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { ProductImage } from '@/components/ProductImage';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToggleWishlist, useWishlist } from '@/hooks/useDiscovery';
import { useIsAuthenticated } from '@/stores/authStore';
import { formatMoney } from '@/utils/money';

export default function WishlistScreen() {
  const navigation = useNavigation();
  const { spacing } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const { data, isLoading, isError, error, refetch } = useWishlist();
  const toggleWishlist = useToggleWishlist();

  if (!isAuthenticated) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState title="Sign in to save favorites" actionLabel="Sign in" onAction={() => navigation.navigate('Login')} />
      </ThemedView>
    );
  }
  if (isLoading) return <LoadingState label="Loading wishlist…" />;
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;
  if (!data || data.length === 0) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState title="Your wishlist is empty" actionLabel="Browse products" onAction={() => navigation.navigate('Search')} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={(item) => `${item.productId}-${item.variantId ?? ''}`}
        contentContainerStyle={{ padding: spacing[4], gap: spacing[3] }}
        renderItem={({ item }) => (
          <Card style={{ flexDirection: 'row', gap: spacing[3] }}>
            <Pressable
              style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden' }}
              onPress={() => item.product && navigation.navigate('ProductDetail', { slug: item.product.slug })}
            >
              <ProductImage storageKey={item.product?.images[0]?.storageKey} altText={item.product?.name} />
            </Pressable>
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <ThemedText variant="bodySmall" weight="medium" numberOfLines={2}>
                {item.product?.name ?? 'Product no longer available'}
              </ThemedText>
              {item.product?.priceRange ? (
                <ThemedText variant="bodySmall">{formatMoney({ amountMinor: item.product.priceRange.minAmountMinor, currency: item.product.priceRange.currency })}</ThemedText>
              ) : null}
              <Button label="Remove" variant="ghost" size="sm" onPress={() => toggleWishlist.mutate({ productId: item.productId })} style={{ alignSelf: 'flex-start' }} />
            </View>
          </Card>
        )}
      />
    </ThemedView>
  );
}
