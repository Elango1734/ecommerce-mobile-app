import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ProductSummaryDto } from '@shopsphere/api-client';
import { fontFamilies, textSizes, textLineHeights } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { EviraButton } from '@/components/evira';
import { ProductImage } from '@/components/ProductImage';
import { categoryIcon } from '@/components/evira/categoryIcon';
import { CheckGlyph, ChevronDownGlyph, ChevronRightGlyph, SearchGlyph } from '@/components/ui/icons';
import { useBrands, useCategories, useProducts } from '@/hooks/useCatalog';
import { formatMoney } from '@/utils/money';
import type { AppParamList } from '@/navigation/types';

/**
 * Two-pane category browser: a rail of categories down the left, the selected
 * category's banner, filters and product tiles on the right — the layout the
 * big marketplace apps use (and the one in the reference shot), drawn in the
 * Evira palette.
 *
 * The reference nests *sub*-categories in the right pane. This backend has a
 * single flat level (every row of GET /categories comes back with
 * `parentId: null`), so the right pane shows the category's products instead,
 * narrowed by filters derived from that category: only the brands and price
 * bands that actually occur in it.
 */

/** Only `createdAt`, `minPriceMinor` and `name` are honoured by the API's sort whitelist
 *  (catalog.service.ts `buildSort`) — anything else silently falls back to newest,
 *  so no option here promises an ordering the backend won't actually apply. */
type SortOption = { label: string; sort: string; order: 'asc' | 'desc' };
const SORT_OPTIONS: SortOption[] = [
  { label: 'Newest', sort: 'createdAt', order: 'desc' },
  { label: 'Price: low to high', sort: 'minPriceMinor', order: 'asc' },
  { label: 'Price: high to low', sort: 'minPriceMinor', order: 'desc' },
  { label: 'Name: A to Z', sort: 'name', order: 'asc' }
];

type PriceBand = { label: string; minPriceMinor?: number; maxPriceMinor?: number };

/** One page is enough to facet the whole catalog at this size; MAX_PAGE_SIZE is 100 server-side. */
const FACET_PAGE_SIZE = 100;
/** Sized to fit the longest category name at `textSizes.description` without the label spilling out of the rail. */
const RAIL_WIDTH = 104;
const PANE_PADDING = 14;
const TILE_GAP = 10;

function Chip({
  label,
  active,
  onPress,
  trailing
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  trailing?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? colors.accent : colors.surfaceSunken, borderColor: active ? colors.accent : colors.borderSubtle }
      ]}
    >
      <ThemedText
        style={{
          fontFamily: fontFamilies.semibold,
          fontSize: textSizes.description,
          lineHeight: textLineHeights.description,
          color: active ? colors.onAccent : colors.textSecondary
        }}
      >
        {label}
      </ThemedText>
      {trailing}
    </Pressable>
  );
}

/** Splits the category's own price spread into three whole-dollar bands. Bands are
 *  disjoint (`+1` minor unit) because the API's price bounds are both inclusive. */
function buildPriceBands(products: ProductSummaryDto[]): PriceBand[] {
  const prices = products
    .map((p) => p.priceRange?.minAmountMinor)
    .filter((amount): amount is number => typeof amount === 'number');
  if (prices.length < 3) return [];

  const currency = products.find((p) => p.priceRange)?.priceRange?.currency ?? 'USD';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const step = Math.ceil((max - min) / 3 / 100) * 100;
  if (step <= 0) return [];

  // Catalog prices sit at .99, so raw thirds would read "Up to $63.99". Snap the
  // boundaries to a round figure whose size follows the spread ($1 / $5 / $10).
  const unit = step >= 1000 ? 1000 : step >= 500 ? 500 : 100;
  const snap = (amountMinor: number) => Math.round(amountMinor / unit) * unit;
  const low = snap(min + step);
  const high = snap(min + step * 2);
  if (low <= min || high <= low || high >= max) return [];

  const money = (amountMinor: number) => formatMoney({ amountMinor, currency });
  return [
    { label: `Up to ${money(low)}`, maxPriceMinor: low },
    { label: `${money(low)} – ${money(high)}`, minPriceMinor: low + 1, maxPriceMinor: high },
    { label: `${money(high)}+`, minPriceMinor: high + 1 }
  ];
}

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<AppParamList, 'Categories'>>();

  const [selectedId, setSelectedId] = useState<string | undefined>(route.params?.categoryId);
  const [brandId, setBrandId] = useState<string | undefined>(undefined);
  const [band, setBand] = useState<PriceBand | undefined>(undefined);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>(SORT_OPTIONS[0]!);
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [paneWidth, setPaneWidth] = useState(0);

  const categories = useCategories();
  const brands = useBrands();
  /** Unfiltered catalog page: drives the rail's per-category counts and the facet
   *  options below. Cached by react-query, so switching categories is local. */
  const catalog = useProducts({ page: 1, pageSize: FACET_PAGE_SIZE });

  // The rail always has a selection — the deep-linked one from Home, else the first.
  const categoryId = selectedId ?? categories.data?.[0]?.id;

  useEffect(() => {
    if (route.params?.categoryId) setSelectedId(route.params.categoryId);
  }, [route.params?.categoryId]);

  // Filters are category-scoped: a brand or band from the previous category is
  // meaningless (and usually empty) in the next one.
  useEffect(() => {
    setBrandId(undefined);
    setBand(undefined);
    setInStockOnly(false);
    setPage(1);
  }, [categoryId]);

  useEffect(() => {
    setPage(1);
  }, [brandId, band, inStockOnly, sortOption]);

  const query = useMemo(
    () => ({
      page,
      pageSize: 20,
      categoryId,
      brandId,
      minPriceMinor: band?.minPriceMinor,
      maxPriceMinor: band?.maxPriceMinor,
      // `inStockOnly` is parsed with `z.coerce.boolean()` server-side, where the
      // string "false" coerces to *true* — so send the flag only when it is on.
      inStockOnly: inStockOnly || undefined,
      sort: sortOption.sort,
      order: sortOption.order
    }),
    [page, categoryId, brandId, band, inStockOnly, sortOption]
  );

  const products = useProducts(query, { enabled: Boolean(categoryId) });

  const allProducts = useMemo(() => catalog.data?.data ?? [], [catalog.data]);
  const countsAreComplete = (catalog.data?.meta.pagination.totalItems ?? 0) <= allProducts.length;
  const countByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of allProducts) counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
    return counts;
  }, [allProducts]);

  const categoryProducts = useMemo(
    () => (categoryId ? allProducts.filter((p) => p.categoryId === categoryId) : []),
    [allProducts, categoryId]
  );

  /** Brands that actually appear in this category, most-stocked first. */
  const brandOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of categoryProducts) {
      if (product.brandId) counts.set(product.brandId, (counts.get(product.brandId) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([id, count]) => ({ id, count, name: brands.data?.find((b) => b.id === id)?.name ?? 'Other' }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [categoryProducts, brands.data]);

  const priceBands = useMemo(() => buildPriceBands(categoryProducts), [categoryProducts]);
  const hasFilters = Boolean(brandId || band || inStockOnly);
  const activeCategory = categories.data?.find((c) => c.id === categoryId);
  const tileWidth = paneWidth > 0 ? (paneWidth - PANE_PADDING * 2 - TILE_GAP * 2) / 3 : 0;

  function clearFilters() {
    setBrandId(undefined);
    setBand(undefined);
    setInStockOnly(false);
  }

  function openFullCategory() {
    navigation.navigate('Search', { categoryId, categoryName: activeCategory?.name });
  }

  const header = (
    <View style={styles.header}>
      <ThemedText numberOfLines={1} style={[styles.headerTitle, { color: colors.textPrimary }]}>
        All Categories
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search products"
        hitSlop={12}
        onPress={() => navigation.navigate('Search', categoryId ? { categoryId, categoryName: activeCategory?.name } : undefined)}
        style={styles.iconButton}
      >
        <SearchGlyph size={22} color={colors.textPrimary} />
      </Pressable>
    </View>
  );

  if (categories.isLoading || catalog.isLoading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
        {header}
        <LoadingState label="Loading categories…" variant="grid" />
      </SafeAreaView>
    );
  }

  if (categories.isError) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
        {header}
        <ErrorState message={(categories.error as Error).message} onRetry={() => categories.refetch()} />
      </SafeAreaView>
    );
  }

  const totalPages = products.data?.meta.pagination.totalPages ?? 1;
  const totalItems = products.data?.meta.pagination.totalItems ?? 0;
  const bannerArt = categoryProducts[0];

  const paneHeader = (
    <View>
      {/* Category banner — the reference's hero strip, using the category's own
          first product as artwork since categories carry no imagery. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Browse all of ${activeCategory?.name ?? 'this category'}`}
        onPress={openFullCategory}
        style={[styles.banner, { backgroundColor: colors.surfaceSunken }]}
      >
        <View style={styles.bannerCopy}>
          <ThemedText numberOfLines={1} style={[styles.bannerTitle, { color: colors.textPrimary }]}>
            {activeCategory?.name ?? 'Category'}
          </ThemedText>
          <View style={[styles.bannerPill, { backgroundColor: colors.accent }]}>
            <ChevronRightGlyph size={16} color={colors.onAccent} />
          </View>
        </View>
        {bannerArt ? (
          <View style={styles.bannerArt}>
            <ProductImage storageKey={bannerArt.images[0]?.storageKey} altText={bannerArt.name} fit="contain" />
          </View>
        ) : null}
      </Pressable>

      {/* Category-derived filters. Brands only appear once a category has more
          than one — a single-option filter is noise. */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
        <Chip
          label={sortOption.label}
          onPress={() => setSheetOpen(true)}
          trailing={<ChevronDownGlyph size={13} color={colors.textSecondary} />}
        />
        <Chip label="In stock" active={inStockOnly} onPress={() => setInStockOnly((v) => !v)} />
        {brandOptions.length > 1
          ? brandOptions.map((brand) => (
              <Chip
                key={brand.id}
                label={`${brand.name} (${brand.count})`}
                active={brandId === brand.id}
                onPress={() => setBrandId(brandId === brand.id ? undefined : brand.id)}
              />
            ))
          : null}
        {priceBands.map((option) => (
          <Chip
            key={option.label}
            label={option.label}
            active={band?.label === option.label}
            onPress={() => setBand(band?.label === option.label ? undefined : option)}
          />
        ))}
        {hasFilters ? <Chip label="Clear" onPress={clearFilters} /> : null}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>In the Spotlight</ThemedText>
        <ThemedText style={[styles.sectionCount, { color: colors.textMuted }]}>
          {products.isLoading ? '…' : `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      {header}
      <View style={styles.body}>
        {/* Left rail */}
        <ScrollView
          style={[styles.rail, { backgroundColor: colors.surfaceSunken }]}
          contentContainerStyle={styles.railContent}
          showsVerticalScrollIndicator={false}
        >
          {(categories.data ?? []).map((category) => {
            const Icon = categoryIcon(category.slug || category.name);
            const active = category.id === categoryId;
            const count = countByCategory.get(category.id) ?? 0;
            return (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={countsAreComplete ? `${category.name}, ${count} items` : category.name}
                onPress={() => setSelectedId(category.id)}
                style={[styles.railItem, active ? { backgroundColor: colors.background } : null]}
              >
                {active ? <View style={[styles.railMarker, { backgroundColor: colors.accent }]} /> : null}
                <View style={[styles.railIcon, { backgroundColor: active ? colors.surfaceSunken : colors.background }]}>
                  <Icon size={22} color={active ? colors.textPrimary : colors.textSecondary} />
                </View>
                <ThemedText
                  numberOfLines={2}
                  style={[
                    styles.railLabel,
                    {
                      fontFamily: active ? fontFamilies.bold : fontFamilies.medium,
                      color: active ? colors.textPrimary : colors.textSecondary
                    }
                  ]}
                >
                  {category.name}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Right pane */}
        <View style={styles.pane} onLayout={(e) => setPaneWidth(e.nativeEvent.layout.width)}>
          {products.isError ? (
            <ErrorState message={(products.error as Error).message} onRetry={() => products.refetch()} />
          ) : (
            <FlatList
              data={products.data?.data ?? []}
              keyExtractor={(item) => item.id}
              numColumns={3}
              columnWrapperStyle={styles.tileRow}
              contentContainerStyle={styles.paneContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={paneHeader}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  onPress={() => navigation.navigate('ProductDetail', { slug: item.slug })}
                  style={[styles.tile, { width: tileWidth || undefined }]}
                >
                  <View style={[styles.tileArt, { backgroundColor: colors.surfaceSunken, height: tileWidth || 84 }]}>
                    <View style={styles.tileArtInset}>
                      <ProductImage
                        storageKey={item.images[0]?.storageKey}
                        altText={item.images[0]?.altText ?? item.name}
                        fit="contain"
                      />
                    </View>
                  </View>
                  <ThemedText numberOfLines={2} style={[styles.tileLabel, { color: colors.textPrimary }]}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={[styles.tilePrice, { color: colors.textSecondary }]}>
                    {item.priceRange
                      ? formatMoney({ amountMinor: item.priceRange.minAmountMinor, currency: item.priceRange.currency })
                      : '—'}
                  </ThemedText>
                </Pressable>
              )}
              ListEmptyComponent={
                products.isLoading ? (
                  <LoadingState label="Loading…" variant="grid" />
                ) : (
                  <EmptyState
                    illustration="notFound"
                    title="Nothing matches"
                    message={`No products in ${activeCategory?.name ?? 'this category'} fit those filters.`}
                    actionLabel={hasFilters ? 'Clear filters' : undefined}
                    onAction={hasFilters ? clearFilters : undefined}
                  />
                )
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
                    <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: textSizes.description, color: colors.textSecondary }}>
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
        </View>
      </View>

      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <ThemedText style={[styles.sheetTitle, { color: colors.textPrimary }]}>Sort by</ThemedText>
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
                  <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: textSizes.normal, color: colors.textPrimary }}>
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
  header: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20 },
  headerTitle: { flex: 1, fontFamily: fontFamilies.bold, fontSize: textSizes.heading, lineHeight: textLineHeights.heading },
  iconButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, flexDirection: 'row' },

  // ScrollView's own base style sets flexGrow: 1, which would let the rail
  // absorb half the row's free space and swallow the pane — pin it to its width.
  rail: { width: RAIL_WIDTH, flexGrow: 0, flexShrink: 0 },
  railContent: { paddingBottom: 24 },
  railItem: { paddingVertical: 14, alignItems: 'center', gap: 6 },
  railMarker: { position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, borderRadius: 2 },
  railIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  railLabel: { fontSize: textSizes.description, lineHeight: textLineHeights.description, textAlign: 'center', paddingHorizontal: 6, alignSelf: 'stretch' },

  pane: { flex: 1 },
  paneContent: { paddingHorizontal: PANE_PADDING, paddingBottom: 24 },
  banner: { height: 104, borderRadius: 16, flexDirection: 'row', overflow: 'hidden', marginTop: 4 },
  bannerCopy: { flex: 1, padding: 14, justifyContent: 'center', gap: 10 },
  bannerTitle: { fontFamily: fontFamilies.bold, fontSize: textSizes.title, lineHeight: textLineHeights.title },
  bannerPill: { width: 34, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  bannerArt: { width: '46%', height: '100%' },

  chipScroll: { gap: 8, paddingTop: 14, paddingRight: PANE_PADDING },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 30, borderRadius: 100, borderWidth: 1, paddingHorizontal: 12 },

  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 20, marginBottom: 12 },
  sectionTitle: { flex: 1, fontFamily: fontFamilies.bold, fontSize: textSizes.title, lineHeight: textLineHeights.title },
  sectionCount: { fontFamily: fontFamilies.medium, fontSize: textSizes.description, lineHeight: textLineHeights.description },

  tileRow: { gap: TILE_GAP, marginBottom: 16 },
  tile: { gap: 6 },
  tileArt: { borderRadius: 14, overflow: 'hidden' },
  tileArtInset: { ...StyleSheet.absoluteFillObject, padding: 7 },
  tileLabel: { fontFamily: fontFamilies.semibold, fontSize: textSizes.description, lineHeight: textLineHeights.description, textAlign: 'center' },
  tilePrice: { fontFamily: fontFamilies.bold, fontSize: textSizes.description, lineHeight: textLineHeights.description, textAlign: 'center' },

  pager: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 16 },
  pagerButton: { height: 40, paddingHorizontal: 12 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  sheetTitle: { fontFamily: fontFamilies.bold, fontSize: textSizes.heading, marginBottom: 16 },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 }
});
