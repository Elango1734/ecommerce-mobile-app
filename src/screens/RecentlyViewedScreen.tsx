import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { EviraHeader } from '@/components/evira';
import { EviraProductCard } from '@/components/evira/ProductCard';
import { useRecentlyViewed } from '@/hooks/useDiscovery';

export default function RecentlyViewedScreen() {
  const { colors } = useTheme();
  const { data, isLoading, isError, error, refetch } = useRecentlyViewed();

  if (isLoading) return <LoadingState label="Loading…" />;
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;

  const products = (data ?? []).map((item) => item.product).filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (products.length === 0) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
        <EviraHeader title="Recently Viewed" />
        <EmptyState title="Nothing viewed yet" message="Products you look at will show up here." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <EviraHeader title="Recently Viewed" />
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrap}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <EviraProductCard product={item} width={168} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  columnWrap: { justifyContent: 'space-between', marginBottom: 20 }
});
