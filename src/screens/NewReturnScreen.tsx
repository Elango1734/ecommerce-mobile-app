import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies, textSizes } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { EviraButton, EviraHeader, EviraScreen } from '@/components/evira';
import { CheckGlyph } from '@/components/ui/icons';
import { useOrder, useCreateReturn } from '@/hooks/useOrders';
import { ApiClientError } from '@shopsphere/api-client';
import type { AppParamList } from '@/navigation/types';

/** No kit screen covers return requests -- restyled for visual consistency with the rest of the app. */
export default function NewReturnScreen() {
  const { orderId } = useRoute<RouteProp<AppParamList, 'NewReturn'>>().params;
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { data: order, isLoading, isError, error, refetch } = useOrder(orderId);
  const createReturn = useCreateReturn();

  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isLoading) return <EviraScreen title="Request a Return"><LoadingState label="Loading order…" /></EviraScreen>;
  if (isError || !order) return <EviraScreen title="Request a Return"><ErrorState message={(error as Error)?.message ?? 'Order not found'} onRetry={() => refetch()} /></EviraScreen>;

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
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <EviraHeader title="Request a Return" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Select items to return</ThemedText>
        {order.items.map((item) => {
          const isSelected = item.variantId in selectedQuantities;
          return (
            <Pressable
              key={item.variantId}
              onPress={() => toggleItem(item.variantId, item.quantity)}
              style={[styles.card, { backgroundColor: colors.surfaceSunken, borderColor: isSelected ? colors.accent : 'transparent' }]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.checkbox, { borderColor: colors.accent, backgroundColor: isSelected ? colors.accent : 'transparent' }]}>
                  {isSelected ? <CheckGlyph size={14} color={colors.onAccent} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: textSizes.normal, color: colors.textPrimary }}>{item.name}</ThemedText>
                  <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: textSizes.description, color: colors.textMuted, marginTop: 2 }}>
                    Purchased qty {item.quantity}
                  </ThemedText>
                </View>
              </View>
              {isSelected ? (
                <View style={styles.stepperRow}>
                  <QuantityStepper
                    quantity={selectedQuantities[item.variantId]!}
                    max={item.quantity}
                    onChange={(next) => setSelectedQuantities((prev) => ({ ...prev, [item.variantId]: next }))}
                  />
                </View>
              ) : null}
            </Pressable>
          );
        })}

        <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 24 }]}>Reason (optional)</ThemedText>
        <TextInput
          value={reason}
          onChangeText={setReason}
          multiline
          placeholder="What's the reason for this return?"
          placeholderTextColor={colors.textMuted}
          style={[styles.textarea, { backgroundColor: colors.surfaceSunken, color: colors.textPrimary }]}
        />

        {submitError ? <ThemedText style={{ color: colors.danger, marginBottom: 12 }}>{submitError}</ThemedText> : null}

        <EviraButton
          label="Submit Return Request"
          loading={createReturn.isPending}
          disabled={Object.keys(selectedQuantities).length === 0}
          onPress={onSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  sectionTitle: { fontFamily: fontFamilies.bold, fontSize: textSizes.title, marginBottom: 14 },
  card: { borderRadius: 18, borderWidth: 2, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepperRow: { marginTop: 12, alignItems: 'flex-end' },
  textarea: { borderRadius: 16, padding: 16, minHeight: 80, textAlignVertical: 'top', fontFamily: fontFamilies.medium, fontSize: textSizes.description, marginBottom: 20 }
});
