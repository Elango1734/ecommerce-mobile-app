import React, { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { useCart } from '@/hooks/useCart';
import { useAddresses } from '@/hooks/useAddresses';
import { useCheckout } from '@/hooks/useCheckout';
import { formatMoney } from '@/utils/money';
import { ApiClientError } from '@shopsphere/api-client';
import type { AppParamList } from '@/navigation/types';

export default function CheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppParamList>>();
  const { colors, spacing, radii } = useTheme();
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
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
        <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
          Shipping address
        </ThemedText>
        {addresses.data.map((address) => {
          const isSelected = address.id === activeAddressId;
          return (
            <Pressable key={address.id} onPress={() => setSelectedAddressId(address.id)}>
              <Card style={{ marginBottom: spacing[3], borderColor: isSelected ? colors.accent : colors.borderSubtle, borderWidth: isSelected ? 2 : 1 }}>
                <ThemedText weight="semibold">{address.fields.recipientName}</ThemedText>
                <ThemedText color="muted">
                  {address.fields.addressLine1}, {address.fields.locality} {address.fields.postalCode}, {address.fields.countryCode}
                </ThemedText>
              </Card>
            </Pressable>
          );
        })}
        <Button label="Add a new address" variant="ghost" onPress={() => navigation.navigate('AddAddress')} style={{ marginBottom: spacing[5] }} />

        <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
          Coupon
        </ThemedText>
        <TextInput
          value={couponCode}
          onChangeText={setCouponCode}
          placeholder="Coupon code (optional)"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.md,
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[4],
            color: colors.textPrimary,
            marginBottom: spacing[5]
          }}
        />

        <Card style={{ marginBottom: spacing[5] }}>
          <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
            Order summary
          </ThemedText>
          {cart.data.items.map((item) => (
            <View key={item.variantId} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[1] }}>
              <ThemedText color="secondary">Qty {item.quantity}</ThemedText>
              <ThemedText>{formatMoney({ amountMinor: item.indicativeUnitPrice.amountMinor * item.quantity, currency: item.indicativeUnitPrice.currency })}</ThemedText>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing[2], paddingTop: spacing[2], borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>
            <ThemedText weight="semibold">Estimated subtotal</ThemedText>
            <ThemedText weight="semibold">{formatMoney({ amountMinor: estimatedSubtotalMinor, currency: cart.data.currency })}</ThemedText>
          </View>
          <ThemedText variant="caption" color="muted" style={{ marginTop: spacing[2] }}>
            Tax, shipping, and any discount are calculated by the server and shown on your confirmed order.
          </ThemedText>
        </Card>

        {submitError ? (
          <ThemedText color="danger" style={{ marginBottom: spacing[3] }}>
            {submitError}
          </ThemedText>
        ) : null}

        <Button label="Place order" fullWidth loading={checkout.isPending} disabled={!activeAddressId || checkout.isPending} onPress={onSubmit} />
      </ScrollView>
    </ThemedView>
  );
}
