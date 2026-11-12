import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ProductSummaryDto } from '@shopsphere/api-client';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { ProductImage } from '@/components/ProductImage';
import { formatMoney } from '@/utils/money';

/** Gap between slides; also the snap interval together with the measured slide width. */
const GAP = 16;
const AUTOPLAY_MS = 3500;
const CARD_HEIGHT = 170;

/**
 * Kit screen 28's "Today's Special" banner: one full-bleed slide at a time,
 * auto-advancing with page dots, swipeable by hand.
 *
 * The kit's slide reads "30% — Today's Special!". This backend exposes no
 * campaign/discount on a product summary (only `priceRange`), so the headline
 * carries the real price instead of a made-up discount percentage.
 */
export function OfferCarousel({ products }: { products: ProductSummaryDto[] }) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const scroller = useRef<ScrollView>(null);
  const [slideWidth, setSlideWidth] = useState(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (products.length < 2 || slideWidth === 0) return;
    const timer = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % products.length;
        scroller.current?.scrollTo({ x: next * (slideWidth + GAP), animated: true });
        return next;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [products.length, slideWidth]);

  if (products.length === 0) return null;

  function onLayout(event: LayoutChangeEvent) {
    setSlideWidth(event.nativeEvent.layout.width);
  }

  /** Keeps the dots (and the autoplay cursor) in step with a manual swipe. */
  function onMomentumScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (slideWidth === 0) return;
    setIndex(Math.round(event.nativeEvent.contentOffset.x / (slideWidth + GAP)));
  }

  return (
    <View onLayout={onLayout}>
      <ScrollView
        ref={scroller}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={slideWidth + GAP}
        decelerationRate="fast"
        disableIntervalMomentum
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={{ gap: GAP }}
      >
        {products.map((product) => (
          <Pressable
            key={product.id}
            accessibilityRole="button"
            accessibilityLabel={`Today's special: ${product.name}`}
            onPress={() => navigation.navigate('ProductDetail', { slug: product.slug })}
            style={[styles.card, { width: slideWidth || undefined, backgroundColor: colors.surfaceSunken }]}
          >
            <View style={styles.copy}>
              <ThemedText style={[styles.headline, { color: colors.textPrimary }]}>
                {product.priceRange
                  ? formatMoney({ amountMinor: product.priceRange.minAmountMinor, currency: product.priceRange.currency })
                  : '—'}
              </ThemedText>
              <ThemedText style={[styles.kicker, { color: colors.textPrimary }]}>Today&rsquo;s Special!</ThemedText>
              <ThemedText numberOfLines={2} style={[styles.sub, { color: colors.textSecondary }]}>
                {product.name}
              </ThemedText>
            </View>
            <View style={styles.art}>
              <ProductImage storageKey={product.images[0]?.storageKey} altText={product.name} fit="contain" />
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {products.length > 1 ? (
        <View style={styles.dots} pointerEvents="none">
          {products.map((product, dotIndex) => (
            <View
              key={product.id}
              style={[
                styles.dot,
                dotIndex === index
                  ? { width: 18, backgroundColor: colors.textPrimary }
                  : { width: 6, backgroundColor: colors.border }
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { height: CARD_HEIGHT, borderRadius: 20, flexDirection: 'row', overflow: 'hidden' },
  copy: { flex: 1, padding: 20, justifyContent: 'center', gap: 2 },
  headline: { fontFamily: fontFamilies.bold, fontSize: 32, lineHeight: 38 },
  kicker: { fontFamily: fontFamilies.bold, fontSize: 16, lineHeight: 21 },
  sub: { fontFamily: fontFamilies.medium, fontSize: 13, lineHeight: 18, marginTop: 4 },
  art: { width: '42%', height: '100%' },
  // Confined to the copy column (the art takes the right 42%) so the dots never
  // sit on top of a photo, where an inactive dot can vanish against dark pixels.
  dots: { position: 'absolute', bottom: 14, left: 0, right: '42%', flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { height: 6, borderRadius: 3 }
});
