import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PromotionDto } from '@shopsphere/api-client';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { EviraHeader } from '@/components/evira';
import { ProductImage } from '@/components/ProductImage';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { MoreGlyph } from '@/components/ui/icons';
import { usePromotions, useProducts, useCategories } from '@/hooks/useCatalog';
import { formatMoney } from '@/utils/money';

/**
 * Kit screen 32. Every card is a real campaign from GET /promotions — the same
 * records pricing.service.ts applies automatically at checkout — so the discount
 * on screen is the discount the customer actually gets, not promo filler.
 */
type OfferSort = 'biggest' | 'ending';

const SORT_LABEL: Record<OfferSort, string> = {
  biggest: 'Biggest discount first',
  ending: 'Ending soonest first'
};

/** Promotions are percentage- or fixed-amount-based; render whichever this one carries. */
function discountLabel(promotion: PromotionDto): string {
  if (promotion.percentageBasisPoints) return `${Math.round(promotion.percentageBasisPoints / 100)}%`;
  if (promotion.discountValue) return formatMoney(promotion.discountValue);
  return 'Offer';
}

function discountWeight(promotion: PromotionDto): number {
  return promotion.percentageBasisPoints ?? promotion.discountValue?.amountMinor ?? 0;
}

function daysLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  if (!Number.isFinite(days) || days <= 0) return 'Ending today';
  return days === 1 ? 'Ends tomorrow' : `${days} days left`;
}

export default function SpecialOffersScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const promotions = usePromotions();
  const categories = useCategories();
  /** One cached catalog page, reused to put a real product from the eligible category on each card. */
  const catalog = useProducts({ page: 1, pageSize: 100 });
  const [sort, setSort] = useState<OfferSort>('biggest');
  const [menuOpen, setMenuOpen] = useState(false);

  const offers = useMemo(() => {
    const list = [...(promotions.data ?? [])];
    list.sort((a, b) =>
      sort === 'biggest'
        ? discountWeight(b) - discountWeight(a)
        : new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
    );
    return list;
  }, [promotions.data, sort]);

  function artFor(promotion: PromotionDto) {
    const products = catalog.data?.data ?? [];
    const byProduct = products.find((p) => promotion.eligibleProductIds.includes(p.id));
    if (byProduct) return byProduct;
    return products.find((p) => promotion.eligibleCategoryIds.includes(p.categoryId));
  }

  function scopeLabel(promotion: PromotionDto): string | undefined {
    const names = (categories.data ?? [])
      .filter((c) => promotion.eligibleCategoryIds.includes(c.id))
      .map((c) => c.name);
    return names.length > 0 ? names.join(', ') : undefined;
  }

  function openOffer(promotion: PromotionDto) {
    const categoryId = promotion.eligibleCategoryIds[0];
    if (categoryId) navigation.navigate('Categories', { categoryId });
    else navigation.navigate('Categories');
  }

  const header = (
    <EviraHeader
      title="Special Offers"
      right={
        <Pressable accessibilityRole="button" accessibilityLabel="Offer options" hitSlop={8} onPress={() => setMenuOpen(true)}>
          <MoreGlyph size={22} color={colors.textPrimary} />
        </Pressable>
      }
    />
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      {header}
      {promotions.isLoading ? (
        <LoadingState label="Loading offers…" />
      ) : promotions.isError ? (
        <ErrorState message={(promotions.error as Error).message} onRetry={() => promotions.refetch()} />
      ) : offers.length === 0 ? (
        <EmptyState
          illustration="empty"
          title="No offers running"
          message="Campaign discounts show up here while they're live. Check back soon."
          actionLabel="Browse categories"
          onAction={() => navigation.navigate('Categories')}
        />
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl tintColor={colors.accent} refreshing={promotions.isFetching} onRefresh={() => promotions.refetch()} />
          }
          renderItem={({ item }) => {
            const art = artFor(item);
            const scope = scopeLabel(item);
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${discountLabel(item)} off ${scope ?? item.name}`}
                onPress={() => openOffer(item)}
                style={[styles.card, { backgroundColor: colors.surfaceSunken }]}
              >
                <View style={styles.copy}>
                  <ThemedText style={[styles.headline, { color: colors.textPrimary }]}>{discountLabel(item)}</ThemedText>
                  <ThemedText numberOfLines={1} style={[styles.kicker, { color: colors.textPrimary }]}>
                    {scope ? `Off all ${scope}` : item.name}
                  </ThemedText>
                  <ThemedText numberOfLines={2} style={[styles.sub, { color: colors.textSecondary }]}>
                    {item.description ?? 'Applied automatically at checkout.'}
                  </ThemedText>
                  <ThemedText style={[styles.meta, { color: colors.textMuted }]}>{daysLeft(item.expiresAt)}</ThemedText>
                </View>
                {art ? (
                  <View style={styles.art}>
                    <ProductImage storageKey={art.images[0]?.storageKey} altText={art.name} fit="contain" />
                  </View>
                ) : null}
              </Pressable>
            );
          }}
        />
      )}

      <ActionMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Sort offers"
        items={[
          { label: SORT_LABEL.biggest, onPress: () => setSort('biggest'), disabled: sort === 'biggest' },
          { label: SORT_LABEL.ending, onPress: () => setSort('ending'), disabled: sort === 'ending' },
          { label: 'Refresh offers', onPress: () => promotions.refetch() }
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32, gap: 16 },
  card: { height: 150, borderRadius: 20, flexDirection: 'row', overflow: 'hidden' },
  copy: { flex: 1, padding: 20, justifyContent: 'center', gap: 2 },
  headline: { fontFamily: fontFamilies.bold, fontSize: 30, lineHeight: 36 },
  kicker: { fontFamily: fontFamilies.bold, fontSize: 15, lineHeight: 20 },
  sub: { fontFamily: fontFamilies.medium, fontSize: 12, lineHeight: 17, marginTop: 2 },
  meta: { fontFamily: fontFamilies.semibold, fontSize: 11, lineHeight: 15, marginTop: 6 },
  art: { width: '38%', height: '100%' }
});
