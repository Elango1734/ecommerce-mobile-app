import React, { useRef } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies, textSizes, textLineHeights } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { ProductImage } from '@/components/ProductImage';
import { EviraButton, EviraHeader, EviraScreen } from '@/components/evira';
import { TrashGlyph } from '@/components/ui/icons';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/hooks/useCart';
import { useIsAuthenticated } from '@/stores/authStore';
import { formatMoney } from '@/utils/money';
import type { CartItemDto } from '@shopsphere/api-client';

function CartRow({ item, onRemove }: { item: CartItemDto; onRemove: () => void }) {
  const { colors } = useTheme();
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
      <View style={styles.row}>
        <View style={[styles.thumb, { backgroundColor: colors.surfaceSunken }]}>
          <ProductImage altText="Cart item" />
        </View>
        <View style={styles.rowBody}>
          <ThemedText style={[styles.rowPrice, { color: colors.textPrimary }]}>{formatMoney(item.indicativeUnitPrice)}</ThemedText>
          <ThemedText style={[styles.rowEach, { color: colors.textMuted }]}>per item</ThemedText>
          <View style={styles.rowFooter}>
            <QuantityStepper quantity={item.quantity} onChange={(next) => updateItem.mutate({ variantId: item.variantId, quantity: next })} />
            <Pressable accessibilityRole="button" accessibilityLabel="Remove item" hitSlop={10} onPress={handleRemove}>
              <TrashGlyph size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

/** Kit screen 55. */
export default function CartScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const { data: cart, isLoading, isError, error, refetch } = useCart();
  const removeItem = useRemoveCartItem();

  if (isLoading) return <EviraScreen title="My Cart"><LoadingState label="Loading your cart…" /></EviraScreen>;
  if (isError) return <EviraScreen title="My Cart"><ErrorState message={(error as Error).message} onRetry={() => refetch()} /></EviraScreen>;
  if (!cart || cart.items.length === 0) {
    return <EviraScreen title="My Cart"><EmptyState illustration="emptyCart" title="Your cart is empty" message="Browse the catalog to find something you'll love." actionLabel="Browse products" onAction={() => navigation.navigate('Categories')} /></EviraScreen>;
  }

  const subtotalMinor = cart.items.reduce((sum, item) => sum + item.indicativeUnitPrice.amountMinor * item.quantity, 0);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <EviraHeader title={`My Cart (${cart.items.length})`} />
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.variantId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <CartRow item={item} onRemove={() => removeItem.mutate(item.variantId)} />}
        ListFooterComponent={
          <View style={styles.summary}>
            <ThemedText style={[styles.note, { color: colors.textMuted }]}>
              Prices shown are indicative — the exact total, including tax and shipping, is calculated at checkout.
            </ThemedText>
            <View style={styles.totalRow}>
              <ThemedText style={[styles.totalLabel, { color: colors.textSecondary }]}>Estimated subtotal</ThemedText>
              <ThemedText style={[styles.totalValue, { color: colors.textPrimary }]}>
                {formatMoney({ amountMinor: subtotalMinor, currency: cart.currency })}
              </ThemedText>
            </View>
            <EviraButton
              label={isAuthenticated ? 'Proceed to Checkout' : 'Sign in to checkout'}
              onPress={() => navigation.navigate(isAuthenticated ? 'Checkout' : 'Login')}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  row: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  thumb: { width: 88, height: 88, borderRadius: 16, overflow: 'hidden' },
  rowBody: { flex: 1, justifyContent: 'center' },
  rowPrice: { fontFamily: fontFamilies.bold, fontSize: textSizes.title, lineHeight: textLineHeights.title },
  rowEach: { fontFamily: fontFamilies.medium, fontSize: textSizes.description, marginTop: 2 },
  rowFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  summary: { marginTop: 8 },
  note: { fontFamily: fontFamilies.medium, fontSize: textSizes.description, lineHeight: textLineHeights.description, marginBottom: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { fontFamily: fontFamilies.semibold, fontSize: textSizes.normal },
  totalValue: { fontFamily: fontFamilies.black, fontSize: textSizes.heading }
});
