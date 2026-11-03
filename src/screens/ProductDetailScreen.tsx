import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { FadeSlideIn } from '@/components/ui/FadeSlideIn';
import { ProductImage } from '@/components/ProductImage';
import { useProduct, useProductQuestions, useProductReviews } from '@/hooks/useCatalog';
import { useAddToCart } from '@/hooks/useCart';
import { useToggleWishlist, useWishlist } from '@/hooks/useDiscovery';
import { useAiCompare, useRelatedProducts, useReviewSummary } from '@/hooks/useAi';
import { useIsAuthenticated } from '@/stores/authStore';
import { formatMoney } from '@/utils/money';
import { getAttributeNames, resolveSelectedVariant } from '@/utils/variants';
import { ApiClientError } from '@shopsphere/api-client';
import type { AppParamList } from '@/navigation/types';

export default function ProductDetailScreen() {
  const { slug } = useRoute<RouteProp<AppParamList, 'ProductDetail'>>().params;
  const navigation = useNavigation();
  const { colors, spacing, radii } = useTheme();
  const isAuthenticated = useIsAuthenticated();

  const { data: product, isLoading, isError, error, refetch } = useProduct(slug);
  const reviews = useProductReviews(slug);
  const questions = useProductQuestions(slug);
  const reviewSummary = useReviewSummary(slug);
  const relatedProducts = useRelatedProducts(slug);
  const wishlist = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const addToCart = useAddToCart();
  const aiCompare = useAiCompare();

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

  const isWishlisted = wishlist.data?.some((item) => item.productId === product.id) ?? false;
  const canAddToCart = Boolean(selectedVariant) && (selectedVariant?.availableQuantity ?? 0) > 0;

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing[8] }}>
        <View style={{ aspectRatio: 1.1, backgroundColor: colors.surfaceSunken }}>
          <ProductImage storageKey={product.images[0]?.storageKey} altText={product.name} />
        </View>

        <FadeSlideIn style={{ padding: spacing[4] }}>
          <ThemedText variant="title">{product.name}</ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginVertical: spacing[2] }}>
            <ThemedText variant="heading" color="accent">
              {formatMoney(selectedVariant?.price ?? { amountMinor: product.priceRange?.minAmountMinor ?? 0, currency: product.priceRange?.currency ?? 'USD' })}
            </ThemedText>
            {selectedVariant?.salePrice ? (
              <ThemedText variant="bodySmall" color="muted" style={{ textDecorationLine: 'line-through' }}>
                {formatMoney(selectedVariant.regularPrice)}
              </ThemedText>
            ) : null}
            {product.ratingCount > 0 ? (
              <ThemedText variant="bodySmall" color="muted">
                ★ {product.ratingAverage.toFixed(1)} ({product.ratingCount} review{product.ratingCount === 1 ? '' : 's'})
              </ThemedText>
            ) : null}
          </View>

          {attributeNames.map((attrName) => {
            const options = [...new Set(product.variants.map((v) => v.attributes[attrName]).filter(Boolean))] as string[];
            return (
              <View key={attrName} style={{ marginBottom: spacing[4] }}>
                <ThemedText variant="label" style={{ marginBottom: spacing[2], textTransform: 'capitalize' }}>
                  {attrName}
                </ThemedText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
                  {options.map((option) => {
                    const isSelected = selection[attrName] === option;
                    return (
                      <Button
                        key={option}
                        label={option}
                        size="sm"
                        variant={isSelected ? 'primary' : 'outline'}
                        onPress={() => setSelection((prev) => ({ ...prev, [attrName]: option }))}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}

          {selectedVariant ? (
            <ThemedText variant="bodySmall" color={selectedVariant.availableQuantity > 0 ? 'muted' : 'danger'} style={{ marginBottom: spacing[3] }}>
              {selectedVariant.availableQuantity > 0 ? `${selectedVariant.availableQuantity} in stock` : 'Out of stock'}
            </ThemedText>
          ) : attributeNames.length > 0 ? (
            <ThemedText variant="bodySmall" color="muted" style={{ marginBottom: spacing[3] }}>
              Select options to see availability
            </ThemedText>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
            <QuantityStepper quantity={quantity} onChange={setQuantity} max={selectedVariant?.availableQuantity ?? 999} />
            <Button
              label={addToCart.isPending ? 'Adding…' : 'Add to cart'}
              disabled={!canAddToCart}
              loading={addToCart.isPending}
              onPress={() => {
                if (!selectedVariant) return;
                addToCart.mutate(
                  { variantId: selectedVariant.id, quantity },
                  { onSuccess: () => setAddedMessage('Added to cart') }
                );
              }}
              style={{ flex: 1 }}
            />
          </View>
          {addedMessage ? (
            <Animated.View style={{ opacity: addedOpacity, marginBottom: spacing[3] }}>
              <ThemedText variant="bodySmall" color="success">
                ✓ {addedMessage}
              </ThemedText>
            </Animated.View>
          ) : null}

          <Animated.View style={{ transform: [{ scale: heartScale }], marginBottom: spacing[5] }}>
            <Button
              label={isWishlisted ? '♥ Saved to wishlist' : '♡ Save to wishlist'}
              variant="outline"
              fullWidth
              onPress={() => {
                if (!isAuthenticated) {
                  navigation.navigate('Login');
                  return;
                }
                pulseHeart();
                toggleWishlist.mutate({ productId: product.id });
              }}
            />
          </Animated.View>

          {product.description ? (
            <Card style={{ marginBottom: spacing[4] }}>
              <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
                Description
              </ThemedText>
              <ThemedText color="secondary">{product.description}</ThemedText>
            </Card>
          ) : null}

          {product.attributes.length > 0 ? (
            <Card style={{ marginBottom: spacing[4] }}>
              <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
                Specifications
              </ThemedText>
              {product.attributes.map((attr) => (
                <View key={attr.name} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[1] }}>
                  <ThemedText color="muted">{attr.name}</ThemedText>
                  <ThemedText>{attr.value}</ThemedText>
                </View>
              ))}
            </Card>
          ) : null}

          {(product.returnPolicyRef || product.warrantyPolicyRef) && (
            <Card style={{ marginBottom: spacing[4] }}>
              {product.returnPolicyRef ? <ThemedText color="muted">Return policy: {product.returnPolicyRef}</ThemedText> : null}
              {product.warrantyPolicyRef ? <ThemedText color="muted">Warranty: {product.warrantyPolicyRef}</ThemedText> : null}
            </Card>
          )}

          {reviewSummary.data && reviewSummary.data.reviewCount > 0 ? (
            <Card style={{ marginBottom: spacing[4], backgroundColor: colors.surfaceSunken }}>
              <ThemedText variant="label" color="muted" style={{ marginBottom: spacing[1] }}>
                Sphere AI review summary
              </ThemedText>
              <ThemedText color="secondary">{reviewSummary.data.summary}</ThemedText>
            </Card>
          ) : null}

          <Card style={{ marginBottom: spacing[4] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
              <ThemedText variant="heading">Reviews</ThemedText>
            </View>
            {reviews.data && reviews.data.data.length > 0 ? (
              reviews.data.data.map((review) => (
                <View key={review.id} style={{ marginBottom: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, paddingBottom: spacing[3] }}>
                  <ThemedText weight="semibold">
                    ★ {review.rating} {review.isVerifiedPurchase ? '· Verified purchase' : ''}
                  </ThemedText>
                  {review.title ? <ThemedText weight="medium">{review.title}</ThemedText> : null}
                  {review.body ? <ThemedText color="secondary">{review.body}</ThemedText> : null}
                </View>
              ))
            ) : (
              <ThemedText color="muted">No reviews yet.</ThemedText>
            )}
          </Card>

          <Card style={{ marginBottom: spacing[4] }}>
            <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
              Questions & answers
            </ThemedText>
            {questions.data && questions.data.data.length > 0 ? (
              questions.data.data.map((q) => (
                <View key={q.id} style={{ marginBottom: spacing[3] }}>
                  <ThemedText weight="medium">Q: {q.body}</ThemedText>
                  {q.answers.map((a) => (
                    <ThemedText key={a.id} color="secondary">
                      A: {a.body}
                    </ThemedText>
                  ))}
                </View>
              ))
            ) : (
              <ThemedText color="muted">No questions yet.</ThemedText>
            )}
          </Card>

          {relatedProducts.data && relatedProducts.data.length > 0 ? (
            <Card style={{ marginBottom: spacing[4] }}>
              <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
                You might also like
              </ThemedText>
              {relatedProducts.data.map((related) => (
                <View
                  key={related.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: spacing[2],
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderSubtle
                  }}
                >
                  <Button
                    label={related.name}
                    variant="ghost"
                    onPress={() => navigation.navigate('ProductDetail', { slug: related.slug })}
                    style={{ flex: 1 }}
                  />
                  <Button label="Compare" size="sm" variant="outline" onPress={() => runCompare(related.id)} />
                </View>
              ))}
              {compareTargetId ? (
                <View style={{ marginTop: spacing[3], padding: spacing[3], backgroundColor: colors.surfaceSunken, borderRadius: radii.md }}>
                  <ThemedText variant="label" color="muted" style={{ marginBottom: spacing[1] }}>
                    Sphere AI comparison
                  </ThemedText>
                  {aiCompare.isPending ? (
                    <ThemedText color="muted">Comparing…</ThemedText>
                  ) : (
                    <ThemedText color="secondary">{compareReply}</ThemedText>
                  )}
                </View>
              ) : null}
            </Card>
          ) : null}

          <Button
            label="Ask Sphere AI about this product"
            variant="secondary"
            fullWidth
            onPress={() => navigation.navigate('AiChat', { seedMessage: `Tell me more about ${product.name}` })}
          />
        </FadeSlideIn>
      </ScrollView>
    </ThemedView>
  );
}
