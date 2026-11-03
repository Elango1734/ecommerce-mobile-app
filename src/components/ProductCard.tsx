import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ProductSummaryDto } from '@shopsphere/api-client';
import { useTheme } from '@/theme/ThemeProvider';
import { shadow } from '@/theme/shadow';
import { ThemedText } from './ui/Themed';
import { AnimatedPressable } from './ui/AnimatedPressable';
import { FadeSlideIn } from './ui/FadeSlideIn';
import { formatMoney } from '@/utils/money';
import { ProductImage } from './ProductImage';

export function ProductCard({ product, index = 0 }: { product: ProductSummaryDto; index?: number }) {
  const navigation = useNavigation();
  const { colors, spacing, radii } = useTheme();

  return (
    <FadeSlideIn delay={Math.min(index, 8) * 45} style={{ width: '48%', marginBottom: spacing[4] }}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={product.name}
        onPress={() => navigation.navigate('ProductDetail', { slug: product.slug })}
        scaleTo={0.95}
      >
        <View style={{ borderRadius: radii.lg, overflow: 'hidden', backgroundColor: colors.surfaceSunken, aspectRatio: 1, ...shadow('sm', colors.textPrimary) }}>
          <ProductImage storageKey={product.images[0]?.storageKey} altText={product.images[0]?.altText ?? product.name} />
          {!product.hasAvailableStock ? (
            <View
              style={{
                position: 'absolute',
                bottom: spacing[2],
                left: spacing[2],
                backgroundColor: colors.surfaceElevated,
                borderRadius: radii.sm,
                paddingHorizontal: spacing[2],
                paddingVertical: 2
              }}
            >
              <ThemedText variant="caption" color="muted">
                Out of stock
              </ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText variant="bodySmall" weight="medium" numberOfLines={2} style={{ marginTop: spacing[2] }}>
          {product.name}
        </ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginTop: 2 }}>
          <ThemedText variant="bodySmall" weight="semibold">
            {product.priceRange ? formatMoney({ amountMinor: product.priceRange.minAmountMinor, currency: product.priceRange.currency }) : '—'}
          </ThemedText>
          {product.ratingCount > 0 ? (
            <ThemedText variant="caption" color="muted">
              ★ {product.ratingAverage.toFixed(1)} ({product.ratingCount})
            </ThemedText>
          ) : null}
        </View>
      </AnimatedPressable>
    </FadeSlideIn>
  );
}
