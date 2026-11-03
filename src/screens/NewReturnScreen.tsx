import React, { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { useOrder } from '@/hooks/useOrders';
import { useCreateReturn } from '@/hooks/useOrders';
import { ApiClientError } from '@shopsphere/api-client';
import type { AppParamList } from '@/navigation/types';

export default function NewReturnScreen() {
  const { orderId } = useRoute<RouteProp<AppParamList, 'NewReturn'>>().params;
  const navigation = useNavigation();
  const { colors, spacing, radii } = useTheme();
  const { data: order, isLoading, isError, error, refetch } = useOrder(orderId);
  const createReturn = useCreateReturn();

  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isLoading) return <LoadingState label="Loading order…" />;
  if (isError || !order) return <ErrorState message={(error as Error)?.message ?? 'Order not found'} onRetry={() => refetch()} />;

  const toggleItem = (variantId: string, maxQuantity: number) => {
    setSelectedQuantities((prev) => {
      const next = { ...prev };
      if (variantId in next) delete next[variantId];
      else next[variantId] = Math.min(1, maxQuantity);
      return next;
    });
  };

  const onSubmit = async () => {
    const items = Object.entries(selectedQuantities).map(([variantId, quantity]) => ({ variantId, quantity }));
    if (items.length === 0) return;
    setSubmitError(null);
    try {
      await createReturn.mutateAsync({ orderId: order.id, items, ...(reason.trim() ? { reason: reason.trim() } : {}) });
      navigation.goBack();
    } catch (err) {
      setSubmitError(err instanceof ApiClientError ? err.message : 'Unable to submit return request.');
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
        <ThemedText variant="heading" style={{ marginBottom: spacing[3] }}>
          Select items to return
        </ThemedText>
        {order.items.map((item) => {
          const isSelected = item.variantId in selectedQuantities;
          return (
            <Card key={item.variantId} style={{ marginBottom: spacing[3], borderColor: isSelected ? colors.accent : colors.borderSubtle, borderWidth: isSelected ? 2 : 1 }}>
              <ThemedText weight="medium">{item.name}</ThemedText>
              <ThemedText variant="bodySmall" color="muted" style={{ marginBottom: spacing[2] }}>
                Purchased qty {item.quantity}
              </ThemedText>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button label={isSelected ? 'Selected' : 'Select'} variant={isSelected ? 'primary' : 'outline'} size="sm" onPress={() => toggleItem(item.variantId, item.quantity)} />
                {isSelected ? (
                  <QuantityStepper
                    quantity={selectedQuantities[item.variantId]!}
                    max={item.quantity}
                    onChange={(next) => setSelectedQuantities((prev) => ({ ...prev, [item.variantId]: next }))}
                  />
                ) : null}
              </View>
            </Card>
          );
        })}

        <ThemedText variant="label" style={{ marginBottom: spacing[1] }}>
          Reason (optional)
        </ThemedText>
        <TextInput
          value={reason}
          onChangeText={setReason}
          multiline
          placeholder="What's the reason for this return?"
          placeholderTextColor={colors.textMuted}
          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing[3], color: colors.textPrimary, minHeight: 60, marginBottom: spacing[4] }}
        />

        {submitError ? (
          <ThemedText color="danger" style={{ marginBottom: spacing[3] }}>
            {submitError}
          </ThemedText>
        ) : null}

        <Button label="Submit return request" fullWidth loading={createReturn.isPending} disabled={Object.keys(selectedQuantities).length === 0} onPress={onSubmit} />
      </ScrollView>
    </ThemedView>
  );
}
