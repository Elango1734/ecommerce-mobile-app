import React, { useRef } from 'react';
import { Animated, FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { FadeSlideIn } from '@/components/ui/FadeSlideIn';
import { ProductImage } from '@/components/ProductImage';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/hooks/useCart';
import { useIsAuthenticated } from '@/stores/authStore';
import { formatMoney } from '@/utils/money';
import type { CartItemDto } from '@shopsphere/api-client';

function CartRow({ item, index, onRemove }: { item: CartItemDto; index: number; onRemove: () => void }) {
  const { spacing } = useTheme();
  const updateItem = useUpdateCartItem();
  const collapse = useRef(new Animated.Value(1)).current;

  function handleRemove() {
    Animated.timing(collapse, { toValue: 0, duration: 220, useNativeDriver: false }).start(({ finished }) => {
      if (finished) onRemove();
    });
  }

  return (
    <Animated.View
      style={{
        opacity: collapse,
        transform: [{ scale: collapse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
        maxHeight: collapse.interpolate({ inputRange: [0, 1], outputRange: [0, 200] })
      }}
    >
      <FadeSlideIn delay={Math.min(index, 8) * 40} style={{ marginBottom: spacing[3] }}>
        <Card elevated="sm" style={{ flexDirection: 'row', gap: spacing[3] }}>
          <View style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden' }}>
            <ProductImage altText="Cart item" />
          </View>
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <ThemedText variant="bodySmall" weight="medium">
              {formatMoney(item.indicativeUnitPrice)} each
            </ThemedText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing[2] }}>
              <QuantityStepper quantity={item.quantity} onChange={(next) => updateItem.mutate({ variantId: item.variantId, quantity: next })} />
              <Button label="Remove" variant="ghost" size="sm" onPress={handleRemove} />
            </View>
          </View>
        </Card>
      </FadeSlideIn>
    </Animated.View>
  );
}

export default function CartScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { spacing } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const { data: cart, isLoading, isError, error, refetch } = useCart();
  const removeItem = useRemoveCartItem();

  if (isLoading) return <LoadingState label="Loading your cart…" />;
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;
  if (!cart || cart.items.length === 0) {
    return <EmptyState title="Your cart is empty" message="Browse the catalog to find something you'll love." actionLabel="Browse products" onAction={() => navigation.navigate('Search')} />;
  }

  const subtotalMinor = cart.items.reduce((sum, item) => sum + item.indicativeUnitPrice.amountMinor * item.quantity, 0);

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.variantId}
        contentContainerStyle={{ padding: spacing[4] }}
        renderItem={({ item, index }: { item: CartItemDto; index: number }) => (
          <CartRow item={item} index={index} onRemove={() => removeItem.mutate(item.variantId)} />
        )}
        ListFooterComponent={
          <FadeSlideIn delay={120} style={{ marginTop: spacing[4] }}>
            <ThemedText color="muted" variant="bodySmall" style={{ marginBottom: spacing[2] }}>
              Prices shown are indicative — the exact total, including tax and shipping, is calculated at checkout.
            </ThemedText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[4] }}>
              <ThemedText variant="heading">Estimated subtotal</ThemedText>
              <ThemedText variant="heading">{formatMoney({ amountMinor: subtotalMinor, currency: cart.currency })}</ThemedText>
            </View>
            <Button
              label={isAuthenticated ? 'Proceed to checkout' : 'Sign in to checkout'}
              fullWidth
              onPress={() => navigation.navigate(isAuthenticated ? 'Checkout' : 'Login')}
            />
          </FadeSlideIn>
        }
      />
    </ThemedView>
  );
}
