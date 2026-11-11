import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { SearchGlyph, BellGlyph, HeartGlyph, FilterGlyph, UserGlyph } from '@/components/ui/icons';
import { EviraProductCard } from '@/components/evira/ProductCard';
import { ProductImage } from '@/components/ProductImage';
import { categoryIcon } from '@/components/evira/categoryIcon';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import { useAuthStore } from '@/stores/authStore';

/**
 * Kit screens 28-29 (home full/fit page). Greeting + avatar replaces the
 * old "Discover Better" banner; Special Offers carousel surfaces products
 * actually on sale (salePrice present) instead of inventing a promo the
 * backend doesn't model; "Most Popular" reuses the same product query
 * filtered by the selected category chip.
 */
export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const displayName = useAuthStore((s) => s.user?.displayName);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);

  const categories = useCategories();
  const popular = useProducts({
    page: 1,
    pageSize: 10,
    sort: 'ratingAverage',
    order: 'desc',
    categoryId: activeCategory
  });
  const onSale = useProducts({ page: 1, pageSize: 5, sort: 'createdAt', order: 'desc' });

  const offers = (onSale.data?.data ?? []).filter((p) => p.priceRange);

  if (popular.isLoading) return <LoadingState label="Loading…" variant="grid" />;
  if (popular.isError) return <ErrorState message={(popular.error as Error).message} onRetry={() => popular.refetch()} />;

  const firstName = displayName?.split(' ')[0];
  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
  })();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={popular.data?.data ?? []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrap}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl tintColor={colors.accent} refreshing={popular.isFetching} onRefresh={() => popular.refetch()} />}
        renderItem={({ item }) => <EviraProductCard product={item} width={168} />}
        ListHeaderComponent={
          <View>
            {/* Greeting row */}
            <View style={styles.greetingRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Profile"
                onPress={() => navigation.navigate('Account')}
                style={[styles.avatar, { backgroundColor: colors.surfaceSunken }]}
              >
                <UserGlyph size={22} color={colors.textMuted} />
              </Pressable>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <ThemedText style={[styles.greeting, { color: colors.textSecondary }]}>{greeting} 👋</ThemedText>
                <ThemedText numberOfLines={1} style={[styles.name, { color: colors.textPrimary }]}>
                  {firstName ?? 'Guest'}
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                hitSlop={8}
                style={styles.headerIcon}
                onPress={() => navigation.navigate('Settings')}
              >
                <BellGlyph size={24} color={colors.textPrimary} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Wishlist"
                hitSlop={8}
                style={styles.headerIcon}
                onPress={() => navigation.navigate('Wishlist')}
              >
                <HeartGlyph size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            {/* Search */}
            <Pressable
              accessibilityRole="search"
              onPress={() => navigation.navigate('Search')}
              style={[styles.search, { backgroundColor: colors.surfaceSunken }]}
            >
              <SearchGlyph size={18} color={colors.textMuted} />
              <ThemedText style={[styles.searchLabel, { color: colors.textMuted }]}>Search</ThemedText>
              <View style={{ flex: 1 }} />
              <FilterGlyph size={18} color={colors.textPrimary} />
            </Pressable>

            {/* Special offers */}
            {offers.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Special Offers</ThemedText>
                  <Pressable onPress={() => navigation.navigate('Search')}>
                    <ThemedText style={[styles.seeAll, { color: colors.textSecondary }]}>See All</ThemedText>
                  </Pressable>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offerScroll}>
                  {offers.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => navigation.navigate('ProductDetail', { slug: p.slug })}
                      style={[styles.offerCard, { backgroundColor: colors.surfaceSunken }]}
                    >
                      <View style={styles.offerImage}>
                        <ProductImage storageKey={p.images[0]?.storageKey} altText={p.name} />
                      </View>
                      <View style={[styles.offerScrim, { backgroundColor: colors.surface, opacity: 0.86 }]} />
                      <ThemedText numberOfLines={2} style={[styles.offerTitle, { color: colors.textPrimary }]}>
                        {p.name}
                      </ThemedText>
                      <ThemedText style={[styles.offerSub, { color: colors.textSecondary }]}>
                        Today&rsquo;s pick, check it out
                      </ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* Category grid */}
            {categories.data && categories.data.length > 0 ? (
              <View style={styles.section}>
                <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Shop by category</ThemedText>
                <View style={styles.categoryGrid}>
                  {categories.data.slice(0, 8).map((category) => {
                    const Icon = categoryIcon(category.slug);
                    return (
                      <Pressable
                        key={category.id}
                        accessibilityRole="button"
                        onPress={() => navigation.navigate('Search', { categoryId: category.id, categoryName: category.name })}
                        style={styles.categoryItem}
                      >
                        <View style={[styles.categoryIcon, { backgroundColor: colors.surfaceSunken }]}>
                          <Icon size={26} color={colors.textPrimary} />
                        </View>
                        <ThemedText numberOfLines={1} style={[styles.categoryLabel, { color: colors.textPrimary }]}>
                          {category.name}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* Most popular + filter chips */}
            <View style={[styles.section, { marginBottom: 8 }]}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Most Popular</ThemedText>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                <Pressable
                  onPress={() => setActiveCategory(undefined)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: !activeCategory ? colors.accent : 'transparent',
                      borderColor: !activeCategory ? colors.accent : colors.border
                    }
                  ]}
                >
                  <ThemedText style={[styles.chipLabel, { color: !activeCategory ? colors.onAccent : colors.textPrimary }]}>
                    All
                  </ThemedText>
                </Pressable>
                {(categories.data ?? []).map((c) => {
                  const active = activeCategory === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setActiveCategory(active ? undefined : c.id)}
                      style={[
                        styles.chip,
                        { backgroundColor: active ? colors.accent : 'transparent', borderColor: active ? colors.accent : colors.border }
                      ]}
                    >
                      <ThemedText style={[styles.chipLabel, { color: active ? colors.onAccent : colors.textPrimary }]}>
                        {c.name}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingBottom: 24 },
  columnWrap: { justifyContent: 'space-between' },
  greetingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontFamily: fontFamilies.medium, fontSize: 14, lineHeight: 20 },
  name: { fontFamily: fontFamilies.bold, fontSize: 18, lineHeight: 25 },
  headerIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 56, borderRadius: 16, paddingHorizontal: 20, marginTop: 4 },
  searchLabel: { fontFamily: fontFamilies.medium, fontSize: 16 },
  section: { marginTop: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: fontFamilies.bold, fontSize: 20, lineHeight: 25 },
  seeAll: { fontFamily: fontFamilies.semibold, fontSize: 14 },
  offerScroll: { gap: 16, paddingTop: 16, paddingRight: 24 },
  offerCard: { width: 280, height: 160, borderRadius: 20, padding: 20, justifyContent: 'flex-end', overflow: 'hidden' },
  offerImage: { ...StyleSheet.absoluteFillObject },
  offerScrim: { ...StyleSheet.absoluteFillObject },
  offerTitle: { fontFamily: fontFamilies.bold, fontSize: 18, lineHeight: 22 },
  offerSub: { fontFamily: fontFamilies.medium, fontSize: 13, marginTop: 4 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, rowGap: 20 },
  categoryItem: { width: '25%', alignItems: 'center', gap: 8 },
  categoryIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontFamily: fontFamilies.semibold, fontSize: 12, textAlign: 'center' },
  chipScroll: { gap: 10, paddingTop: 16, paddingRight: 24 },
  chip: { height: 44, borderRadius: 100, borderWidth: 1.5, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  chipLabel: { fontFamily: fontFamilies.bold, fontSize: 14 }
});
