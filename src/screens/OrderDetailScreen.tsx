import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { EviraButton, EviraHeader } from '@/components/evira';
import { StarFilledGlyph, StarGlyph, TruckGlyph } from '@/components/ui/icons';
import { useCancelOrder, useOrder, useOrderShipments } from '@/hooks/useOrders';
import { useCreateReview } from '@/hooks/useReviews';
import { formatMoney } from '@/utils/money';
import { ApiClientError } from '@shopsphere/api-client';
import type { AppParamList } from '@/navigation/types';

const CANCELLABLE_STATUSES = new Set(['pending', 'confirmed']);

function ReviewForm({ orderId, orderItemVariantId }: { orderId: string; orderItemVariantId: string }) {
  const { colors } = useTheme();
  const createReview = useCreateReview();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [result, setResult] = useState<'success' | string | null>(null);

  if (result === 'success') {
    return <ThemedText style={{ fontFamily: fontFamilies.semibold, color: colors.success, marginTop: 8 }}>Thanks for your review!</ThemedText>;
  }

  return (
    <View style={{ marginTop: 10 }}>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} accessibilityLabel={`Rate ${value} stars`} onPress={() => setRating(value)}>
            {value <= rating ? <StarFilledGlyph size={22} color={colors.warning} /> : <StarGlyph size={22} color={colors.textMuted} />}
          </Pressable>
        ))}
      </View>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Share your thoughts (optional)"
        placeholderTextColor={colors.textMuted}
        multiline
        style={[styles.reviewInput, { borderColor: colors.border, color: colors.textPrimary }]}
      />
      {typeof result === 'string' ? (
        <ThemedText style={{ fontFamily: fontFamilies.medium, color: colors.danger, marginBottom: 8 }}>{result}</ThemedText>
      ) : null}
      <EviraButton
        label="Submit review"
        loading={createReview.isPending}
        onPress={() =>
          createReview.mutate(
            { orderId, orderItemVariantId, rating, ...(body.trim() ? { body: body.trim() } : {}) },
            {
              onSuccess: () => setResult('success'),
              onError: (error) => setResult(error instanceof ApiClientError ? error.message : 'Unable to submit review')
            }
          )
        }
        style={styles.reviewSubmit}
      />
    </View>
  );
}

/** Kit screens 67-70 (ongoing track order, completed list, leave a review). */
export default function OrderDetailScreen() {
  const { id } = useRoute<RouteProp<AppParamList, 'OrderDetail'>>().params;
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);
  const shipments = useOrderShipments(id);
  const cancelOrder = useCancelOrder(id ?? '');
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [reviewingVariantId, setReviewingVariantId] = useState<string | null>(null);

  if (isLoading) return <LoadingState label="Loading order…" />;
  if (isError || !order) return <ErrorState message={(error as Error)?.message ?? 'Order not found'} onRetry={() => refetch()} />;

  const canCancel = CANCELLABLE_STATUSES.has(order.fulfillmentStatus);
  const canReturn = order.fulfillmentStatus === 'delivered';

  const row = (label: string, value: string, bold?: boolean) => (
    <View style={styles.costRow} key={label}>
      <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: 14, color: colors.textSecondary }}>{label}</ThemedText>
      <ThemedText style={{ fontFamily: bold ? fontFamilies.bold : fontFamilies.semibold, fontSize: bold ? 16 : 14, color: colors.textPrimary }}>
        {value}
      </ThemedText>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <EviraHeader title={`Order #${order.id.slice(-8).toUpperCase()}`} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.placed, { color: colors.textMuted }]}>Placed {new Date(order.placedAt).toLocaleDateString()}</ThemedText>
        <View style={styles.badgeRow}>
          <StatusBadge status={order.paymentStatus} />
          <StatusBadge status={order.fulfillmentStatus} />
        </View>

        {shipments.data && shipments.data.length > 0 ? (
          <View style={[styles.section, { backgroundColor: colors.surfaceSunken, borderRadius: 20, padding: 20 }]}>
            <View style={styles.trackingHeader}>
              <TruckGlyph size={20} color={colors.textPrimary} />
              <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Tracking</ThemedText>
            </View>
            {shipments.data.map((shipment) => (
              <View key={shipment.id} style={{ marginTop: 12 }}>
                <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: 14, color: colors.textPrimary }}>
                  {shipment.carrier ?? 'Carrier TBD'} {shipment.trackingNumber ? `· ${shipment.trackingNumber}` : ''}
                </ThemedText>
                <View style={{ marginTop: 4 }}>
                  <StatusBadge status={shipment.status} />
                </View>
                {shipment.trackingEvents.map((event, i) => (
                  <ThemedText key={i} style={{ fontFamily: fontFamilies.medium, fontSize: 12, color: colors.textMuted, marginTop: 6 }}>
                    {new Date(event.occurredAt).toLocaleString()} — {event.status.replace(/_/g, ' ')}
                  </ThemedText>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Items</ThemedText>
          {order.items.map((item, index) => (
            <View key={`${item.variantId}-${index}`} style={[styles.itemRow, { borderBottomColor: colors.borderSubtle, borderBottomWidth: index < order.items.length - 1 ? 1 : 0 }]}>
              <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: 15, color: colors.textPrimary }}>{item.name}</ThemedText>
              <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')} · Qty {item.quantity}
              </ThemedText>
              <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: 14, color: colors.textPrimary, marginTop: 4 }}>
                {formatMoney(item.lineTotal)}
              </ThemedText>
              {order.fulfillmentStatus === 'delivered' ? (
                reviewingVariantId === item.variantId ? (
                  <ReviewForm orderId={order.id} orderItemVariantId={item.variantId} />
                ) : (
                  <Pressable onPress={() => setReviewingVariantId(item.variantId)} style={{ marginTop: 8 }}>
                    <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: 14, color: colors.accent }}>Write a review</ThemedText>
                  </Pressable>
                )
              ) : null}
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surfaceSunken, borderRadius: 20, padding: 20 }]}>
          {row('Subtotal', formatMoney(order.itemSubtotal))}
          {row('Discount', `-${formatMoney(order.discountTotal)}`)}
          {row('Tax', formatMoney(order.taxTotal))}
          {row('Shipping', formatMoney(order.shippingTotal))}
          <View style={[styles.totalDivider, { borderTopColor: colors.border }]}>{row('Total', formatMoney(order.grandTotal), true)}</View>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Shipping address</ThemedText>
          <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: 15, color: colors.textPrimary }}>{order.shippingAddress.recipientName}</ThemedText>
          <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
            {order.shippingAddress.addressLine1}, {order.shippingAddress.locality} {order.shippingAddress.postalCode}, {order.shippingAddress.countryCode}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Status history</ThemedText>
          {order.statusHistory.map((entry, i) => (
            <ThemedText key={i} style={{ fontFamily: fontFamilies.medium, fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>
              {new Date(entry.changedAt).toLocaleString()} — {entry.track}: {entry.status.replace(/_/g, ' ')}
            </ThemedText>
          ))}
        </View>

        {cancelError ? <ThemedText style={{ color: colors.danger, marginBottom: 12 }}>{cancelError}</ThemedText> : null}

        <View style={{ gap: 12, marginTop: 8 }}>
          {canCancel ? (
            <Pressable
              onPress={() => cancelOrder.mutate('Customer requested cancellation', { onError: (e) => setCancelError((e as Error).message) })}
              style={[styles.dangerButton, { borderColor: colors.danger }]}
            >
              <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: 16, color: colors.danger }}>
                {cancelOrder.isPending ? 'Cancelling…' : 'Cancel order'}
              </ThemedText>
            </Pressable>
          ) : null}
          {canReturn ? (
            <EviraButton label="Request a return" variant="outline" onPress={() => navigation.navigate('NewReturn', { orderId: order.id })} />
          ) : null}
          <EviraButton label="Ask Sphere AI about this order" variant="outline" onPress={() => navigation.navigate('AiChat', { mode: 'support', orderId: order.id })} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  placed: { fontFamily: fontFamilies.medium, fontSize: 13, marginTop: 8 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  section: { marginTop: 24 },
  sectionTitle: { fontFamily: fontFamilies.bold, fontSize: 18, marginBottom: 12 },
  trackingHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemRow: { paddingVertical: 12 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalDivider: { borderTopWidth: 1, marginTop: 8, paddingTop: 8 },
  starRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  reviewInput: { borderWidth: 1.5, borderRadius: 16, padding: 14, minHeight: 70, fontFamily: fontFamilies.medium, fontSize: 14, marginBottom: 10 },
  reviewSubmit: { height: 46 },
  dangerButton: { height: 56, borderRadius: 100, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' }
});
