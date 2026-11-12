import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { EviraButton, EviraHeader } from '@/components/evira';
import { EviraProductCard } from '@/components/evira/ProductCard';
import { PriceRangeSlider } from '@/components/ui/PriceRangeSlider';
import { CloseGlyph, FilterGlyph, SearchGlyph, StarFilledGlyph } from '@/components/ui/icons';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import type { AppParamList } from '@/navigation/types';

/**
 * Kit screens 34-37: keyword entry over a recent-search list, the results grid,
 * the not-found state, and the sort & filter sheet.
 *
 * Every control maps onto a real query parameter — `categoryId`, `minPriceMinor`
 * /`maxPriceMinor`, `minRating`, `sort`/`order` — so the sheet never promises an
 * ordering or cut the backend won't apply.
 */
const RECENTS_KEY = 'shopsphere.recent-searches';
const MAX_RECENTS = 8;

type SortOption = { key: string; label: string; sort: string; order: 'asc' | 'desc' };
const SORT_OPTIONS: SortOption[] = [
  { key: 'popular', label: 'Popular', sort: 'ratingAverage', order: 'desc' },
  { key: 'recent', label: 'Most Recent', sort: 'createdAt', order: 'desc' },
  { key: 'priceHigh', label: 'Price High', sort: 'minPriceMinor', order: 'desc' },
  { key: 'priceLow', label: 'Price Low', sort: 'minPriceMinor', order: 'asc' }
];

const RATING_OPTIONS = [0, 5, 4, 3, 2];

type Filters = {
  categoryId?: string;
  price: [number, number];
  minRating: number;
  sortKey: string;
};

export default function SearchScreen() {
  const { colors } = useTheme();
  const route = useRoute<RouteProp<AppParamList, 'Search'>>();
  const params = route.params;

  const categories = useCategories();
  /** One cached catalog page: supplies the price bounds and distribution the slider draws. */
  const catalog = useProducts({ page: 1, pageSize: 100 });

  const prices = useMemo(
    () =>
      (catalog.data?.data ?? [])
        .map((p) => p.priceRange?.minAmountMinor)
        .filter((amount): amount is number => typeof amount === 'number'),
    [catalog.data]
  );
  const currency = catalog.data?.data.find((p) => p.priceRange)?.priceRange?.currency ?? 'USD';
  const bounds = useMemo<[number, number]>(
    () => (prices.length > 0 ? [Math.min(...prices), Math.max(...prices)] : [0, 100000]),
    [prices]
  );

  const clampPrice = useCallback(
    (price: [number, number]): [number, number] => [
      Math.min(Math.max(price[0], bounds[0]), bounds[1]),
      Math.max(Math.min(price[1], bounds[1]), bounds[0])
    ],
    [bounds]
  );

  const emptyFilters = useCallback(
    (): Filters => ({ categoryId: params?.categoryId, price: bounds, minRating: 0, sortKey: 'recent' }),
    [bounds, params?.categoryId]
  );

  const [queryText, setQueryText] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);

  // Price bounds only exist once the catalog page lands; widen the untouched
  // selection to match rather than leaving it pinned at the 0-1000 placeholder.
  useEffect(() => {
    setFilters((current) => (current.price[0] === 0 && current.price[1] === 100000 ? { ...current, price: bounds } : current));
  }, [bounds]);

  useEffect(() => {
    AsyncStorage.getItem(RECENTS_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) setRecents(parsed.filter((term): term is string => typeof term === 'string'));
      })
      .catch(() => undefined);
  }, []);

  const persistRecents = useCallback((next: string[]) => {
    setRecents(next);
    void AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  function runSearch(term: string) {
    const trimmed = term.trim();
    setQueryText(trimmed);
    setSubmitted(trimmed);
    setPage(1);
    if (trimmed.length > 0) {
      persistRecents([trimmed, ...recents.filter((r) => r.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENTS));
    }
  }

  const activeSort = SORT_OPTIONS.find((o) => o.key === filters.sortKey) ?? SORT_OPTIONS[1]!;
  const priceTouched = filters.price[0] !== bounds[0] || filters.price[1] !== bounds[1];

  const query = useMemo(
    () => ({
      page,
      pageSize: 20,
      q: submitted || undefined,
      categoryId: filters.categoryId,
      minPriceMinor: priceTouched ? filters.price[0] : undefined,
      maxPriceMinor: priceTouched ? filters.price[1] : undefined,
      minRating: filters.minRating > 0 ? filters.minRating : undefined,
      sort: activeSort.sort,
      order: activeSort.order
    }),
    [page, submitted, filters, priceTouched, activeSort]
  );

  const products = useProducts(query);
  const totalItems = products.data?.meta.pagination.totalItems ?? 0;
  const totalPages = products.data?.meta.pagination.totalPages ?? 1;
  const showRecents = submitted.length === 0 && queryText.length === 0 && !params?.categoryId;
  const filterCount =
    (filters.categoryId ? 1 : 0) + (priceTouched ? 1 : 0) + (filters.minRating > 0 ? 1 : 0) + (filters.sortKey !== 'recent' ? 1 : 0);

  const searchField = (
    <View style={styles.searchRow}>
      <View style={[styles.field, { backgroundColor: colors.surfaceSunken }]}>
        <SearchGlyph size={18} color={colors.textMuted} />
        <TextInput
          value={queryText}
          onChangeText={setQueryText}
          onSubmitEditing={(e) => runSearch(e.nativeEvent.text)}
          returnKeyType="search"
          autoFocus={!params?.categoryId}
          placeholder="Search products"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Search products"
          style={[styles.input, { color: colors.textPrimary }]}
        />
        {queryText.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}
            onPress={() => {
              setQueryText('');
              setSubmitted('');
            }}
          >
            <CloseGlyph size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sort and filter"
        onPress={() => {
          setDraft({ ...filters, price: clampPrice(filters.price) });
          setSheetOpen(true);
        }}
        style={[styles.filterButton, { backgroundColor: filterCount > 0 ? colors.accent : colors.surfaceSunken }]}
      >
        <FilterGlyph size={20} color={filterCount > 0 ? colors.onAccent : colors.textPrimary} />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <EviraHeader title={params?.categoryName ?? 'Search'} />
      {searchField}

      {showRecents ? (
        <View style={styles.recents}>
          <View style={styles.recentsHeader}>
            <ThemedText style={[styles.recentsTitle, { color: colors.textPrimary }]}>Recent</ThemedText>
            {recents.length > 0 ? (
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => persistRecents([])}>
                <ThemedText style={[styles.clearAll, { color: colors.textSecondary }]}>Clear All</ThemedText>
              </Pressable>
            ) : null}
          </View>
          {recents.length === 0 ? (
            <ThemedText style={[styles.recentsEmpty, { color: colors.textMuted }]}>
              Searches you run will be listed here.
            </ThemedText>
          ) : (
            <FlatList
              data={recents}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <View style={styles.recentRow}>
                  <Pressable style={styles.recentHit} accessibilityRole="button" onPress={() => runSearch(item)}>
                    <ThemedText style={[styles.recentLabel, { color: colors.textSecondary }]}>{item}</ThemedText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item} from recent searches`}
                    hitSlop={10}
                    onPress={() => persistRecents(recents.filter((r) => r !== item))}
                  >
                    <CloseGlyph size={16} color={colors.textMuted} />
                  </Pressable>
                </View>
              )}
            />
          )}
        </View>
      ) : products.isLoading ? (
        <LoadingState label="Searching…" variant="grid" />
      ) : products.isError ? (
        <ErrorState message={(products.error as Error).message} onRetry={() => products.refetch()} />
      ) : (
        <FlatList
          data={products.data?.data ?? []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrap}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.resultHeader}>
              <ThemedText numberOfLines={1} style={[styles.resultTitle, { color: colors.textPrimary }]}>
                {submitted ? `Results for "${submitted}"` : 'All results'}
              </ThemedText>
              <ThemedText style={[styles.resultCount, { color: colors.textMuted }]}>
                {totalItems} found
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => <EviraProductCard product={item} width={168} />}
          ListEmptyComponent={
            <EmptyState
              illustration="notFound"
              title="Not Found"
              message="Sorry, the keyword you entered cannot be found. Please check again or search with another keyword."
              actionLabel={filterCount > 0 ? 'Reset filters' : undefined}
              onAction={filterCount > 0 ? () => setFilters(emptyFilters()) : undefined}
            />
          }
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
                  loading={products.isFetching}
                  disabled={page >= totalPages}
                  onPress={() => setPage((p) => p + 1)}
                  style={styles.pagerButton}
                />
              </View>
            ) : null
          }
        />
      )}

      {/* Kit screen 37 */}
      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.grabber, { backgroundColor: colors.border }]} />
            <ThemedText style={[styles.sheetTitle, { color: colors.textPrimary }]}>Sort &amp; Filter</ThemedText>

            <ScrollView showsVerticalScrollIndicator={false}>
              <ThemedText style={[styles.groupLabel, { color: colors.textPrimary }]}>Categories</ThemedText>
              <View style={styles.chipWrap}>
                <FilterChip label="All" active={!draft.categoryId} onPress={() => setDraft({ ...draft, categoryId: undefined })} />
                {(categories.data ?? []).map((category) => (
                  <FilterChip
                    key={category.id}
                    label={category.name}
                    active={draft.categoryId === category.id}
                    onPress={() => setDraft({ ...draft, categoryId: draft.categoryId === category.id ? undefined : category.id })}
                  />
                ))}
              </View>

              <ThemedText style={[styles.groupLabel, { color: colors.textPrimary }]}>Price Range</ThemedText>
              <PriceRangeSlider
                min={bounds[0]}
                max={bounds[1]}
                currency={currency}
                prices={prices}
                value={draft.price}
                onChange={(price) => setDraft((current) => ({ ...current, price }))}
              />

              <ThemedText style={[styles.groupLabel, { color: colors.textPrimary }]}>Sort by</ThemedText>
              <View style={styles.chipWrap}>
                {SORT_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.key}
                    label={option.label}
                    active={draft.sortKey === option.key}
                    onPress={() => setDraft({ ...draft, sortKey: option.key })}
                  />
                ))}
              </View>

              <ThemedText style={[styles.groupLabel, { color: colors.textPrimary }]}>Rating</ThemedText>
              <View style={styles.chipWrap}>
                {RATING_OPTIONS.map((rating) => (
                  <FilterChip
                    key={rating}
                    label={rating === 0 ? 'All' : `${rating}`}
                    leading={<StarFilledGlyph size={13} color={draft.minRating === rating ? colors.onAccent : colors.warning} />}
                    active={draft.minRating === rating}
                    onPress={() => setDraft({ ...draft, minRating: rating })}
                  />
                ))}
              </View>
            </ScrollView>

            <View style={styles.sheetActions}>
              <EviraButton
                label="Reset"
                variant="outline"
                onPress={() => setDraft({ categoryId: undefined, price: bounds, minRating: 0, sortKey: 'recent' })}
                style={styles.sheetButton}
              />
              <EviraButton
                label="Apply"
                onPress={() => {
                  setFilters(draft);
                  setPage(1);
                  setSheetOpen(false);
                }}
                style={styles.sheetButton}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  active,
  onPress,
  leading
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  leading?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? colors.accent : 'transparent', borderColor: active ? colors.accent : colors.border }
      ]}
    >
      {leading}
      <ThemedText
        style={{ fontFamily: fontFamilies.semibold, fontSize: 14, color: active ? colors.onAccent : colors.textPrimary }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginTop: 8 },
  field: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 56, borderRadius: 16, paddingHorizontal: 20 },
  input: { flex: 1, fontFamily: fontFamilies.semibold, fontSize: 16 },
  filterButton: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  recents: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  recentsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  recentsTitle: { fontFamily: fontFamilies.bold, fontSize: 18, lineHeight: 23 },
  clearAll: { fontFamily: fontFamilies.semibold, fontSize: 13 },
  recentsEmpty: { fontFamily: fontFamilies.medium, fontSize: 14, marginTop: 12 },
  recentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  recentHit: { flex: 1 },
  recentLabel: { fontFamily: fontFamilies.medium, fontSize: 15, lineHeight: 20 },

  resultHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 16, gap: 12 },
  resultTitle: { flex: 1, fontFamily: fontFamilies.bold, fontSize: 17, lineHeight: 22 },
  resultCount: { fontFamily: fontFamilies.semibold, fontSize: 12, lineHeight: 16 },
  listContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  columnWrap: { justifyContent: 'space-between', marginBottom: 20 },
  pager: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 16 },
  pagerButton: { height: 44, paddingHorizontal: 16 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '85%', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
  grabber: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, marginBottom: 12 },
  sheetTitle: { fontFamily: fontFamilies.bold, fontSize: 20, textAlign: 'center', marginBottom: 8 },
  groupLabel: { fontFamily: fontFamilies.bold, fontSize: 15, lineHeight: 20, marginTop: 20, marginBottom: 12 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 40, borderRadius: 100, borderWidth: 1.5, paddingHorizontal: 18 },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  sheetButton: { flex: 1, height: 52 }
});
