import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ProductSummaryDto } from '@shopsphere/api-client';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ProductImage } from '@/components/ProductImage';
import { ThemedText } from '@/components/ui/Themed';
import { HeartFilledGlyph, HeartGlyph, StarFilledGlyph } from '@/components/ui/icons';
import { useToggleWishlist, useWishlist } from '@/hooks/useDiscovery';
import { formatMoney } from '@/utils/money';

/** The kit's product tile: rounded image, heart overlay, name, rating, price. */
export function EviraProductCard({ product, width = 168 }: { product: ProductSummaryDto; width?: number }) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const wishlist = useWishlist();
  const toggle = useToggleWishlist();

  const wished = useMemo(
    () => wishlist.data?.some((w) => w.productId === product.id) ?? false,
    [wishlist.data, product.id]
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={product.name}
      onPress={() => navigation.navigate('ProductDetail', { slug: product.slug })}
      style={[styles.root, { width }]}
    >
      <View style={[styles.imageWrap, { backgroundColor: colors.surfaceSunken, height: width }]}>
        <ProductImage storageKey={product.images[0]?.storageKey} altText={product.images[0]?.altText ?? product.name} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation();
            toggle.mutate({ productId: product.id });
          }}
          style={[styles.heart, { backgroundColor: colors.surface }]}
        >
          {wished ? (
            <HeartFilledGlyph size={16} color={colors.danger} />
          ) : (
            <HeartGlyph size={16} color={colors.textPrimary} />
          )}
        </Pressable>
        {!product.hasAvailableStock ? (
          <View style={[styles.badge, { backgroundColor: colors.surface }]}>
            <ThemedText variant="caption" color="muted">
              Out of stock
            </ThemedText>
          </View>
        ) : null}
      </View>

      <ThemedText numberOfLines={1} style={[styles.name, { color: colors.textPrimary }]}>
        {product.name}
      </ThemedText>
      <View style={styles.row}>
        <ThemedText style={[styles.price, { color: colors.textPrimary }]}>
          {product.priceRange
            ? formatMoney({ amountMinor: product.priceRange.minAmountMinor, currency: product.priceRange.currency })
            : '—'}
        </ThemedText>
        {product.ratingCount > 0 ? (
          <View style={styles.rating}>
            <StarFilledGlyph size={13} color={colors.warning} />
            <ThemedText style={[styles.ratingLabel, { color: colors.textSecondary }]}>
              {product.ratingAverage.toFixed(1)}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {},
  imageWrap: { borderRadius: 16, overflow: 'hidden' },
  heart: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', left: 10, bottom: 10, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  name: { fontFamily: fontFamilies.semibold, fontSize: 14, lineHeight: 20, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  price: { fontFamily: fontFamilies.bold, fontSize: 16, lineHeight: 22 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingLabel: { fontFamily: fontFamilies.semibold, fontSize: 13 }
});
