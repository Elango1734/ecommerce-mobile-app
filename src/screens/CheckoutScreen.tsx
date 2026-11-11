import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { EviraButton, EviraHeader } from '@/components/evira';
import { MapPinGlyph, PlusGlyph, TagGlyph } from '@/components/ui/icons';
import { useCart } from '@/hooks/useCart';
import { useAddresses } from '@/hooks/useAddresses';
import { useCheckout } from '@/hooks/useCheckout';
import { formatMoney } from '@/utils/money';
import { ApiClientError } from '@shopsphere/api-client';
import type { AppParamList } from '@/navigation/types';

/**
 * Kit screens 57-65 are a multi-step wizard (shipping method, payment
 * method, PIN entry). This backend's checkout endpoint only ever takes
 * shippingAddressId + an optional couponCode (see
 * packages/api-client/src/modules/checkout.ts) -- there's no shipping-method
 * or payment-method selection to build a real step around, so this stays
 * one screen rather than a wizard of steps that would submit nothing.
 */
export default function CheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppParamList>>();
  const { colors } = useTheme();
  const cart = useCart();
  const addresses = useAddresses();
  const checkout = useCheckout();

  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);
  const [couponCode, setCouponCode] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultAddress = addresses.data?.find((a) => a.isDefault) ?? addresses.data?.[0];
  const activeAddressId = selectedAddressId ?? defaultAddress?.id;

  if (cart.isLoading || addresses.isLoading) return <LoadingState label="Preparing checkout…" />;
  if (cart.isError) return <ErrorState message={(cart.error as Error).message} onRetry={() => cart.refetch()} />;
  if (!cart.data || cart.data.items.length === 0) {
    return <EmptyState title="Your cart is empty" message="Add something to your cart before checking out." />;
  }
  if (!addresses.data || addresses.data.length === 0) {
    return (
      <EmptyState
        title="Add a shipping address"
        message="You'll need at least one address to check out."
        actionLabel="Add address"
        onAction={() => navigation.navigate('AddAddress')}
      />
    );
  }

  const estimatedSubtotalMinor = cart.data.items.reduce((sum, item) => sum + item.indicativeUnitPrice.amountMinor * item.quantity, 0);

  const onSubmit = async () => {
    if (!activeAddressId) return;
    setSubmitError(null);
    try {
      const result = await checkout.mutateAsync({
        shippingAddressId: activeAddressId,
        ...(couponCode.trim() ? { couponCode: couponCode.trim() } : {}),
        simulate: 'success'
      });
      navigation.replace('OrderDetail', { id: result.orderId });
    } catch (error) {
      setSubmitError(error instanceof ApiClientError ? error.message : 'Unable to complete checkout. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <EviraHeader title="Checkout" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Shipping Address</ThemedText>
        {addresses.data.map((address) => {
          const isSelected = address.id === activeAddressId;
          return (
            <Pressable
              key={address.id}
              onPress={() => setSelectedAddressId(address.id)}
              style={[styles.addressCard, { backgroundColor: colors.surfaceSunken, borderColor: isSelected ? colors.accent : 'transparent' }]}
            >
              <View style={[styles.addressIcon, { backgroundColor: colors.surface }]}>
                <MapPinGlyph size={20} color={colors.textPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: 15, color: colors.textPrimary }}>{address.fields.recipientName}</ThemedText>
                <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                  {address.fields.addressLine1}, {address.fields.locality} {address.fields.postalCode}, {address.fields.countryCode}
                </ThemedText>
              </View>
              <View style={[styles.radio, { borderColor: isSelected ? colors.accent : colors.border, backgroundColor: isSelected ? colors.accent : 'transparent' }]} />
            </Pressable>
          );
        })}
        <Pressable onPress={() => navigation.navigate('AddAddress')} style={styles.addAddress}>
          <PlusGlyph size={18} color={colors.textPrimary} />
          <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: 15, color: colors.textPrimary }}>Add a new address</ThemedText>
        </Pressable>

        <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 28 }]}>Promo Code</ThemedText>
        <View style={[styles.promoField, { backgroundColor: colors.surfaceSunken }]}>
          <TagGlyph size={18} color={colors.textMuted} />
          <TextInput
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder="Enter coupon code"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            style={[styles.promoInput, { color: colors.textPrimary }]}
          />
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.surfaceSunken }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Order Summary</ThemedText>
          {cart.data.items.map((item) => (
            <View key={item.variantId} style={styles.summaryRow}>
              <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: 14, color: colors.textSecondary }}>Qty {item.quantity}</ThemedText>
              <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: 14, color: colors.textPrimary }}>
                {formatMoney({ amountMinor: item.indicativeUnitPrice.amountMinor * item.quantity, currency: item.indicativeUnitPrice.currency })}
              </ThemedText>
            </View>
          ))}
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: 16, color: colors.textPrimary }}>Estimated subtotal</ThemedText>
            <ThemedText style={{ fontFamily: fontFamilies.black, fontSize: 18, color: colors.textPrimary }}>
              {formatMoney({ amountMinor: estimatedSubtotalMinor, currency: cart.data.currency })}
            </ThemedText>
          </View>
          <ThemedText style={[styles.note, { color: colors.textMuted }]}>
            Tax, shipping, and any discount are calculated by the server and shown on your confirmed order.
          </ThemedText>
        </View>

        {submitError ? <ThemedText style={{ color: colors.danger, marginTop: 16 }}>{submitError}</ThemedText> : null}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderSubtle }]}>
        <EviraButton label="Place Order" loading={checkout.isPending} disabled={!activeAddressId || checkout.isPending} onPress={onSubmit} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  sectionTitle: { fontFamily: fontFamilies.bold, fontSize: 18, marginBottom: 14 },
  addressCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, borderWidth: 2, padding: 16, marginBottom: 12 },
  addressIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  addAddress: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  promoField: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, borderRadius: 16, paddingHorizontal: 20 },
  promoInput: { flex: 1, fontFamily: fontFamilies.semibold, fontSize: 15 },
  summaryCard: { borderRadius: 20, padding: 20, marginTop: 28 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
  note: { fontFamily: fontFamilies.medium, fontSize: 12, lineHeight: 17, marginTop: 10 },
  footer: { paddingHorizontal: 24, paddingTop: 12, borderTopWidth: 1 }
});
