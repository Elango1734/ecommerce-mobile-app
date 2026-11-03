import React from 'react';
import { FlatList } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedView } from '@/components/ui/Themed';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { ProductCard } from '@/components/ProductCard';
import { useRecentlyViewed } from '@/hooks/useDiscovery';

export default function RecentlyViewedScreen() {
  const { spacing } = useTheme();
  const { data, isLoading, isError, error, refetch } = useRecentlyViewed();

  if (isLoading) return <LoadingState label="Loading…" />;
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;

  const products = (data ?? []).map((item) => item.product).filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (products.length === 0) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState title="Nothing viewed yet" message="Products you look at will show up here." />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: spacing[4] }}
        contentContainerStyle={{ paddingVertical: spacing[4] }}
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </ThemedView>
  );
}
