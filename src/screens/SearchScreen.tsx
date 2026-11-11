import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { EviraButton, EviraHeader } from '@/components/evira';
import { EviraProductCard } from '@/components/evira/ProductCard';
import { CheckGlyph, FilterGlyph, SearchGlyph } from '@/components/ui/icons';
import { useProducts } from '@/hooks/useCatalog';
import type { AppParamList } from '@/navigation/types';

type SortOption = { label: string; sort: string; order: 'asc' | 'desc' };
const SORT_OPTIONS: SortOption[] = [
  { label: 'Newest', sort: 'createdAt', order: 'desc' },
  { label: 'Price: low to high', sort: 'minPriceMinor', order: 'asc' },
  { label: 'Price: high to low', sort: 'minPriceMinor', order: 'desc' },
  { label: 'Top rated', sort: 'ratingAverage', order: 'desc' }
];

/** Kit screens 34-37: keyword entry, results grid, not-found, sort & filter sheet. */
export default function SearchScreen() {
  const { colors } = useTheme();
  const route = useRoute<RouteProp<AppParamList, 'Search'>>();
  const params = route.params;

  const [queryText, setQueryText] = useState('');
  const [debouncedText, setDebouncedText] = useState('');
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>(SORT_OPTIONS[0]!);
  const [categoryId, setCategoryId] = useState<string | undefined>(params?.categoryId);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedText(queryText), 350);
    return () => clearTimeout(timer);
  }, [queryText]);

  useEffect(() => {
    setPage(1);
  }, [debouncedText, categoryId, sortOption]);

  const query = useMemo(
    () => ({ page, pageSize: 20, q: debouncedText || undefined, categoryId, sort: sortOption.sort, order: sortOption.order }),
    [page, debouncedText, categoryId, sortOption]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useProducts(query);
  const totalPages = data?.meta.pagination.totalPages ?? 1;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <EviraHeader title={params?.categoryName ?? 'Search'} />

      <View style={styles.searchRow}>
        <View style={[styles.field, { backgroundColor: colors.surfaceSunken }]}>
          <SearchGlyph size={18} color={colors.textMuted} />
          <TextInput
            value={queryText}
            onChangeText={setQueryText}
            placeholder="Search products"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Search products"
            style={[styles.input, { color: colors.textPrimary }]}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sort and filter"
          onPress={() => setSheetOpen(true)}
          style={[styles.filterButton, { backgroundColor: colors.surfaceSunken }]}
        >
          <FilterGlyph size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      {categoryId ? (
        <Pressable
          onPress={() => setCategoryId(undefined)}
          style={[styles.activeChip, { backgroundColor: colors.accent }]}
        >
          <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: 13, color: colors.onAccent }}>
            {params?.categoryName ?? 'Category'} ✕
          </ThemedText>
        </Pressable>
      ) : null}

      {isLoading ? (
        <LoadingState label="Searching…" variant="grid" />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : (data?.data.length ?? 0) === 0 ? (
        <EmptyState illustration="notFound" title="No results found" message="Try a different search term or clear your filters." />
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrap}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <EviraProductCard product={item} width={168} />}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.pager}>
                <EviraButton
                  label="Previous"
                  variant="outline"
                  disabled={page <= 1}
                  onPress={() => setPage((p) => p - 1)}
                  style={styles.pagerButton}
                />
                <ThemedText style={{ fontFamily: fontFamilies.semibold, color: colors.textSecondary }}>
                  {page} / {totalPages}
                </ThemedText>
                <EviraButton
                  label="Next"
                  variant="outline"
                  loading={isFetching}
                  disabled={page >= totalPages}
                  onPress={() => setPage((p) => p + 1)}
                  style={styles.pagerButton}
                />
              </View>
            ) : null
          }
        />
      )}

      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <ThemedText style={[styles.sheetTitle, { color: colors.textPrimary }]}>Sort &amp; Filter</ThemedText>
            {SORT_OPTIONS.map((option) => {
              const active = sortOption.label === option.label;
              return (
                <Pressable
                  key={option.label}
                  onPress={() => {
                    setSortOption(option);
                    setSheetOpen(false);
                  }}
                  style={styles.sortRow}
                >
                  <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: 16, color: colors.textPrimary }}>
                    {option.label}
                  </ThemedText>
                  {active ? <CheckGlyph size={20} color={colors.accent} /> : null}
                </Pressable>
              );
            })}
            <EviraButton label="Done" onPress={() => setSheetOpen(false)} style={{ marginTop: 16 }} />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginTop: 8 },
  field: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 56, borderRadius: 16, paddingHorizontal: 20 },
  input: { flex: 1, fontFamily: fontFamilies.semibold, fontSize: 16 },
  filterButton: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  activeChip: { alignSelf: 'flex-start', marginHorizontal: 24, marginTop: 16, borderRadius: 100, paddingHorizontal: 16, paddingVertical: 8 },
  listContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  columnWrap: { justifyContent: 'space-between', marginBottom: 20 },
  pager: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 16 },
  pagerButton: { height: 44, paddingHorizontal: 16 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  sheetTitle: { fontFamily: fontFamilies.bold, fontSize: 20, marginBottom: 16 },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 }
});
