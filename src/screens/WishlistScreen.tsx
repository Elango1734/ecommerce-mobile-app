import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { EviraHeader, EviraScreen } from '@/components/evira';
import { EviraProductCard } from '@/components/evira/ProductCard';
import { useWishlist } from '@/hooks/useDiscovery';
import { useIsAuthenticated } from '@/stores/authStore';

/** Kit screen 31. Reuses EviraProductCard, which already drives its own heart toggle off useWishlist. */
export default function WishlistScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const { data, isLoading, isError, error, refetch } = useWishlist();

  if (!isAuthenticated) {
    return (
      <EviraScreen title="My Wishlist">
        <EmptyState illustration="login" title="Sign in to save favorites" actionLabel="Sign in" onAction={() => navigation.navigate('Login')} />
      </EviraScreen>
    );
  }
  if (isLoading) return <EviraScreen title="My Wishlist"><LoadingState label="Loading wishlist…" /></EviraScreen>;
  if (isError) return <EviraScreen title="My Wishlist"><ErrorState message={(error as Error).message} onRetry={() => refetch()} /></EviraScreen>;

  const items = (data ?? []).filter((item) => item.product);
  if (items.length === 0) {
    return (
      <EviraScreen title="My Wishlist">
        <EmptyState illustration="wishlist" title="Your wishlist is empty" actionLabel="Browse products" onAction={() => navigation.navigate('Categories')} />
      </EviraScreen>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <EviraHeader title="My Wishlist" />
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.productId}-${item.variantId ?? ''}`}
        numColumns={2}
        columnWrapperStyle={styles.columnWrap}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <EviraProductCard product={item.product!} width={168} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  columnWrap: { justifyContent: 'space-between', marginBottom: 20 }
});
