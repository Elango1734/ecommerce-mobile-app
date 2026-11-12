import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ProductSummaryDto } from '@shopsphere/api-client';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ProductImage } from '@/components/ProductImage';
import { ThemedText } from '@/components/ui/Themed';
import { HeartFilledGlyph, HeartGlyph, StarFilledGlyph } from '@/components/ui/icons';
import { useWishlistToggle } from '@/hooks/useDiscovery';
import { formatMoney } from '@/utils/money';

/**
 * The kit's product tile: a grey panel holding the photo *inset* (never bled to
 * the edges), a dark heart button, then name, rating row and price.
 *
 * The inset matters for consistency: the seeded photos are ordinary
 * photographs with wildly different backdrops (grass, pavement, a desk), so
 * edge-to-edge `cover` made every tile a different colour. Containing the
 * photo inside a padded `surfaceSunken` panel gives all tiles the same frame,
 * which is what the kit's cut-out product shots do naturally.
 */
export function EviraProductCard({ product, width = 168 }: { product: ProductSummaryDto; width?: number }) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const wishlist = useWishlistToggle();
  const wished = wishlist.isWishlisted(product.id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={product.name}
      onPress={() => navigation.navigate('ProductDetail', { slug: product.slug })}
      style={[styles.root, { width }]}
    >
      <View style={[styles.imageWrap, { backgroundColor: colors.surfaceSunken, height: width }]}>
        <View style={styles.imageInset}>
          <View style={styles.imageFrame}>
            <ProductImage
              storageKey={product.images[0]?.storageKey}
              altText={product.images[0]?.altText ?? product.name}
              fit="contain"
            />
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          hitSlop={8}
          // No stopPropagation needed: the touch responder is granted to the
          // innermost Pressable, so the card's own onPress never fires from here.
          onPress={() => wishlist.toggle(product.id)}
          style={[styles.heart, { backgroundColor: colors.accent }]}
        >
          {wished ? (
            <HeartFilledGlyph size={16} color={colors.danger} />
          ) : (
            <HeartGlyph size={16} color={colors.onAccent} />
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

      {/* The kit puts a "8.374 sold" pill next to the stars; this backend tracks
          review counts, not units sold, so the pill carries that instead of a
          fabricated sales figure. Hidden entirely until a product has reviews. */}
      {product.ratingCount > 0 ? (
        <View style={styles.ratingRow}>
          <StarFilledGlyph size={13} color={colors.warning} />
          <ThemedText style={[styles.ratingLabel, { color: colors.textPrimary }]}>
            {product.ratingAverage.toFixed(1)}
          </ThemedText>
          <View style={[styles.reviewPill, { backgroundColor: colors.surfaceSunken }]}>
            <ThemedText style={[styles.reviewLabel, { color: colors.textSecondary }]}>
              {product.ratingCount} {product.ratingCount === 1 ? 'review' : 'reviews'}
            </ThemedText>
          </View>
        </View>
      ) : null}

      <ThemedText style={[styles.price, { color: colors.textPrimary }]}>
        {product.priceRange
          ? formatMoney({ amountMinor: product.priceRange.minAmountMinor, currency: product.priceRange.currency })
          : '—'}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {},
  imageWrap: { borderRadius: 16, overflow: 'hidden' },
  imageInset: { ...StyleSheet.absoluteFillObject, padding: 12 },
  imageFrame: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  heart: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', left: 10, bottom: 10, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  name: { fontFamily: fontFamilies.semibold, fontSize: 14, lineHeight: 20, marginTop: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  ratingLabel: { fontFamily: fontFamilies.bold, fontSize: 13, lineHeight: 17 },
  reviewPill: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  reviewLabel: { fontFamily: fontFamilies.medium, fontSize: 11, lineHeight: 15 },
  price: { fontFamily: fontFamilies.bold, fontSize: 16, lineHeight: 22, marginTop: 6 }
});
