import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies, textSizes, textLineHeights } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { ProductImage } from '@/components/ProductImage';
import { EviraButton } from '@/components/evira';
import { ArrowLeftGlyph, HeartFilledGlyph, HeartGlyph, ShareGlyph, StarFilledGlyph } from '@/components/ui/icons';
import { useProduct, useProductQuestions, useProductReviews } from '@/hooks/useCatalog';
import { useAddToCart } from '@/hooks/useCart';
import { track } from '@/analytics/track';
import { useWishlistToggle } from '@/hooks/useDiscovery';
import { useAiCompare, useRelatedProducts, useReviewSummary } from '@/hooks/useAi';
import { formatMoney } from '@/utils/money';
import { getAttributeNames, resolveSelectedVariant } from '@/utils/variants';
import { ApiClientError } from '@shopsphere/api-client';
import type { AppParamList } from '@/navigation/types';

/** Kit screens 38-54 (category + detail pairs, view reviews). */
export default function ProductDetailScreen() {
  const { slug } = useRoute<RouteProp<AppParamList, 'ProductDetail'>>().params;
  const navigation = useNavigation();
  const { colors } = useTheme();

  const { data: product, isLoading, isError, error, refetch } = useProduct(slug);
  const reviews = useProductReviews(slug);
  const questions = useProductQuestions(slug);
  const reviewSummary = useReviewSummary(slug);
  const relatedProducts = useRelatedProducts(slug);
  const wishlist = useWishlistToggle();
  const addToCart = useAddToCart();
  const aiCompare = useAiCompare();

  // One view per product, keyed on the ids themselves so re-renders do not
  // inflate the count and the effect's deps stay exhaustive.
  const viewedProductId = product?.id;
  const viewedCategoryId = product?.categoryId;
  useEffect(() => {
    if (viewedProductId) track('product_view', { productId: viewedProductId, categoryId: viewedCategoryId });
  }, [viewedProductId, viewedCategoryId]);

  const attributeNames = useMemo(() => (product ? getAttributeNames(product.variants) : []), [product]);

  const [selection, setSelection] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const [compareTargetId, setCompareTargetId] = useState<string | null>(null);
  const [compareReply, setCompareReply] = useState<string | null>(null);
  const heartScale = useRef(new Animated.Value(1)).current;
  const addedOpacity = useRef(new Animated.Value(0)).current;

  function pulseHeart() {
    heartScale.setValue(1);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.3, useNativeDriver: true, speed: 50, bounciness: 14 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 })
    ]).start();
  }

  useEffect(() => {
    if (!addedMessage) return;
    addedOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(addedOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(addedOpacity, { toValue: 0, duration: 220, useNativeDriver: true })
    ]).start(({ finished }) => {
      if (finished) setAddedMessage(null);
    });
  }, [addedMessage, addedOpacity]);

  const selectedVariant = useMemo(
    () => (product ? resolveSelectedVariant(product.variants, attributeNames, selection) : undefined),
    [product, selection, attributeNames]
  );

  function runCompare(targetId: string) {
    if (!product) return;
    setCompareTargetId(targetId);
    setCompareReply(null);
    aiCompare.mutate(
      { productIds: [product.id, targetId] },
      {
        onSuccess: (result) => setCompareReply(result.reply),
        onError: (err) => setCompareReply(err instanceof ApiClientError ? err.message : 'Comparison is unavailable right now.')
      }
    );
  }

  if (isLoading) return <LoadingState label="Loading product…" />;
  if (isError || !product) return <ErrorState message={(error as Error)?.message ?? 'Product not found'} onRetry={() => refetch()} />;

  const isWishlisted = wishlist.isWishlisted(product.id);
  const canAddToCart = Boolean(selectedVariant) && (selectedVariant?.availableQuantity ?? 0) > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.surfaceSunken }]}>
          <ProductImage storageKey={product.images[0]?.storageKey} altText={product.name} />
          <SafeAreaView style={styles.heroOverlay} edges={['top']}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => navigation.goBack()}
              style={[styles.circleButton, { backgroundColor: colors.surface }]}
            >
              <ArrowLeftGlyph size={22} color={colors.textPrimary} />
            </Pressable>
            <View style={styles.heroActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share"
                style={[styles.circleButton, { backgroundColor: colors.surface }]}
              >
                <ShareGlyph size={20} color={colors.textPrimary} />
              </Pressable>
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  onPress={() => {
                    pulseHeart();
                    wishlist.toggle(product.id);
                  }}
                  style={[styles.circleButton, { backgroundColor: colors.surface }]}
                >
                  {isWishlisted ? (
                    <HeartFilledGlyph size={20} color={colors.danger} />
                  ) : (
                    <HeartGlyph size={20} color={colors.textPrimary} />
                  )}
                </Pressable>
              </Animated.View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <ThemedText numberOfLines={2} style={[styles.title, { color: colors.textPrimary, flex: 1 }]}>
              {product.name}
            </ThemedText>
            {product.ratingCount > 0 ? (
              <View style={[styles.ratingPill, { backgroundColor: colors.surfaceSunken }]}>
                <StarFilledGlyph size={14} color={colors.warning} />
                <ThemedText style={[styles.ratingLabel, { color: colors.textPrimary }]}>
                  {product.ratingAverage.toFixed(1)} ({product.ratingCount})
                </ThemedText>
              </View>
            ) : null}
          </View>

          <View style={styles.priceRow}>
            <ThemedText style={[styles.price, { color: colors.textPrimary }]}>
              {formatMoney(
                selectedVariant?.price ?? {
                  amountMinor: product.priceRange?.minAmountMinor ?? 0,
                  currency: product.priceRange?.currency ?? 'USD'
                }
              )}
            </ThemedText>
            {selectedVariant?.salePrice ? (
              <ThemedText style={[styles.priceStrike, { color: colors.textMuted }]}>
                {formatMoney(selectedVariant.regularPrice)}
              </ThemedText>
            ) : null}
          </View>

          {attributeNames.map((attrName) => {
            const options = [...new Set(product.variants.map((v) => v.attributes[attrName]).filter(Boolean))] as string[];
            return (
              <View key={attrName} style={styles.section}>
                <ThemedText style={[styles.sectionLabel, { color: colors.textPrimary }]}>{attrName}</ThemedText>
                <View style={styles.pillRow}>
                  {options.map((option) => {
                    const isSelected = selection[attrName] === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setSelection((prev) => ({ ...prev, [attrName]: option }))}
                        style={[
                          styles.optionPill,
                          {
                            backgroundColor: isSelected ? colors.accent : 'transparent',
                            borderColor: isSelected ? colors.accent : colors.border
                          }
                        ]}
                      >
                        <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: textSizes.description, color: isSelected ? colors.onAccent : colors.textPrimary }}>
                          {option}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {selectedVariant ? (
            <ThemedText style={[styles.stock, { color: selectedVariant.availableQuantity > 0 ? colors.textSecondary : colors.danger }]}>
              {selectedVariant.availableQuantity > 0 ? `${selectedVariant.availableQuantity} in stock` : 'Out of stock'}
            </ThemedText>
          ) : attributeNames.length > 0 ? (
            <ThemedText style={[styles.stock, { color: colors.textSecondary }]}>Select options to see availability</ThemedText>
          ) : null}

          {addedMessage ? (
            <Animated.View style={{ opacity: addedOpacity }}>
              <ThemedText style={{ fontFamily: fontFamilies.semibold, color: colors.success, marginBottom: 8 }}>
                ✓ {addedMessage}
              </ThemedText>
            </Animated.View>
          ) : null}

          {product.description ? (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Description</ThemedText>
              <ThemedText style={[styles.body16, { color: colors.textSecondary }]}>{product.description}</ThemedText>
            </View>
          ) : null}

          {product.attributes.length > 0 ? (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Specifications</ThemedText>
              {product.attributes.map((attr) => (
                <View key={attr.name} style={styles.specRow}>
                  <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: textSizes.description, color: colors.textSecondary }}>{attr.name}</ThemedText>
                  <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: textSizes.description, color: colors.textPrimary }}>{attr.value}</ThemedText>
                </View>
              ))}
            </View>
          ) : null}

          {product.returnPolicyRef || product.warrantyPolicyRef ? (
            <View style={[styles.policyCard, { backgroundColor: colors.surfaceSunken }]}>
              {product.returnPolicyRef ? (
                <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: textSizes.description, color: colors.textSecondary }}>
                  Return policy: {product.returnPolicyRef}
                </ThemedText>
              ) : null}
              {product.warrantyPolicyRef ? (
                <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: textSizes.description, color: colors.textSecondary }}>
                  Warranty: {product.warrantyPolicyRef}
                </ThemedText>
              ) : null}
            </View>
          ) : null}

          {reviewSummary.data && reviewSummary.data.reviewCount > 0 ? (
            <View style={[styles.aiCard, { backgroundColor: colors.surfaceSunken }]}>
              <ThemedText style={[styles.aiLabel, { color: colors.textMuted }]}>Sphere AI review summary</ThemedText>
              <ThemedText style={[styles.body16, { color: colors.textSecondary }]}>{reviewSummary.data.summary}</ThemedText>
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Reviews {product.ratingCount > 0 ? `(${product.ratingCount})` : ''}
            </ThemedText>
            {reviews.data && reviews.data.data.length > 0 ? (
              reviews.data.data.map((review) => (
                <View key={review.id} style={[styles.reviewRow, { borderBottomColor: colors.borderSubtle }]}>
                  <View style={styles.reviewHeader}>
                    <StarFilledGlyph size={14} color={colors.warning} />
                    <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: textSizes.description, color: colors.textPrimary }}>
                      {review.rating} {review.isVerifiedPurchase ? '· Verified purchase' : ''}
                    </ThemedText>
                  </View>
                  {review.title ? (
                    <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: textSizes.description, color: colors.textPrimary, marginTop: 4 }}>
                      {review.title}
                    </ThemedText>
                  ) : null}
                  {review.body ? (
                    <ThemedText style={[styles.body16, { color: colors.textSecondary, marginTop: 2 }]}>{review.body}</ThemedText>
                  ) : null}
                </View>
              ))
            ) : (
              <ThemedText style={{ color: colors.textMuted }}>No reviews yet.</ThemedText>
            )}
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Questions &amp; answers</ThemedText>
            {questions.data && questions.data.data.length > 0 ? (
              questions.data.data.map((q) => (
                <View key={q.id} style={{ marginBottom: 12 }}>
                  <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: textSizes.description, color: colors.textPrimary }}>Q: {q.body}</ThemedText>
                  {q.answers.map((a) => (
                    <ThemedText key={a.id} style={[styles.body16, { color: colors.textSecondary }]}>
                      A: {a.body}
                    </ThemedText>
                  ))}
                </View>
              ))
            ) : (
              <ThemedText style={{ color: colors.textMuted }}>No questions yet.</ThemedText>
            )}
          </View>

          {relatedProducts.data && relatedProducts.data.length > 0 ? (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>You might also like</ThemedText>
              {relatedProducts.data.map((related) => (
                <View key={related.id} style={[styles.relatedRow, { borderBottomColor: colors.borderSubtle }]}>
                  <Pressable style={{ flex: 1 }} onPress={() => navigation.navigate('ProductDetail', { slug: related.slug })}>
                    <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: textSizes.normal, color: colors.textPrimary }}>
                      {related.name}
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => runCompare(related.id)}
                    style={[styles.compareButton, { borderColor: colors.border }]}
                  >
                    <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: textSizes.description, color: colors.textPrimary }}>Compare</ThemedText>
                  </Pressable>
                </View>
              ))}
              {compareTargetId ? (
                <View style={[styles.aiCard, { backgroundColor: colors.surfaceSunken, marginTop: 12 }]}>
                  <ThemedText style={[styles.aiLabel, { color: colors.textMuted }]}>Sphere AI comparison</ThemedText>
                  {aiCompare.isPending ? (
                    <ThemedText style={{ color: colors.textMuted }}>Comparing…</ThemedText>
                  ) : (
                    <ThemedText style={[styles.body16, { color: colors.textSecondary }]}>{compareReply}</ThemedText>
                  )}
                </View>
              ) : null}
            </View>
          ) : null}

          <EviraButton
            label="Ask Sphere AI about this product"
            variant="outline"
            onPress={() => navigation.navigate('AiChat', { seedMessage: `Tell me more about ${product.name}` })}
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.borderSubtle }]}>
        <QuantityStepper quantity={quantity} onChange={setQuantity} max={selectedVariant?.availableQuantity ?? 999} />
        <EviraButton
          label={addToCart.isPending ? 'Adding…' : 'Add to Cart'}
          disabled={!canAddToCart}
          loading={addToCart.isPending}
          onPress={() => {
            if (!selectedVariant) return;
            addToCart.mutate(
              { variantId: selectedVariant.id, quantity },
              {
                onSuccess: () => {
                  setAddedMessage('Added to cart');
                  // Tracked on success only — a failed add is not a cart add.
                  track('add_to_cart', { productId: product.id });
                }
              }
            );
          }}
          style={styles.addToCartButton}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  hero: { aspectRatio: 1.1 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  heroActions: { flexDirection: 'row', gap: 12 },
  circleButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 24, paddingTop: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  title: { fontFamily: fontFamilies.bold, fontSize: textSizes.heading, lineHeight: textLineHeights.heading },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 6 },
  ratingLabel: { fontFamily: fontFamilies.semibold, fontSize: textSizes.description },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  price: { fontFamily: fontFamilies.black, fontSize: textSizes.heading, lineHeight: textLineHeights.heading },
  priceStrike: { fontFamily: fontFamilies.medium, fontSize: textSizes.normal, textDecorationLine: 'line-through' },
  section: { marginTop: 24 },
  sectionLabel: { fontFamily: fontFamilies.bold, fontSize: textSizes.description, marginBottom: 10, textTransform: 'capitalize' },
  sectionTitle: { fontFamily: fontFamilies.bold, fontSize: textSizes.title, lineHeight: textLineHeights.title, marginBottom: 10 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionPill: { borderWidth: 1.5, borderRadius: 100, paddingHorizontal: 18, paddingVertical: 10 },
  stock: { fontFamily: fontFamilies.semibold, fontSize: textSizes.description, marginTop: 16 },
  body16: { fontFamily: fontFamilies.medium, fontSize: textSizes.normal, lineHeight: textLineHeights.normal },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  policyCard: { borderRadius: 16, padding: 16, marginTop: 20, gap: 4 },
  aiCard: { borderRadius: 16, padding: 16, marginTop: 20 },
  aiLabel: { fontFamily: fontFamilies.bold, fontSize: textSizes.description, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  reviewRow: { borderBottomWidth: 1, paddingVertical: 14 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  relatedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, paddingVertical: 14 },
  compareButton: { borderWidth: 1.5, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingTop: 12, borderTopWidth: 1 },
  addToCartButton: { flex: 1 }
});
