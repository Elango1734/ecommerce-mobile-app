import React, { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { useCancelOrder, useOrder, useOrderShipments } from '@/hooks/useOrders';
import { useCreateReview } from '@/hooks/useReviews';
import { formatMoney } from '@/utils/money';
import { ApiClientError } from '@shopsphere/api-client';
import type { AppParamList } from '@/navigation/types';

const CANCELLABLE_STATUSES = new Set(['pending', 'confirmed']);

function ReviewForm({ orderId, orderItemVariantId }: { orderId: string; orderItemVariantId: string }) {
  const { colors, spacing, radii } = useTheme();
  const createReview = useCreateReview();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [result, setResult] = useState<'success' | string | null>(null);

  if (result === 'success') {
    return (
      <ThemedText variant="bodySmall" color="success" style={{ marginTop: spacing[2] }}>
        Thanks for your review!
      </ThemedText>
    );
  }

  return (
    <View style={{ marginTop: spacing[2] }}>
      <View style={{ flexDirection: 'row', gap: spacing[1], marginBottom: spacing[2] }}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} accessibilityLabel={`Rate ${value} stars`} onPress={() => setRating(value)}>
            <ThemedText variant="heading" color={value <= rating ? 'accent' : 'muted'}>
              ★
            </ThemedText>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Share your thoughts (optional)"
        placeholderTextColor={colors.textMuted}
        multiline
        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing[3], color: colors.textPrimary, minHeight: 60, marginBottom: spacing[2] }}
      />
      {typeof result === 'string' ? (
        <ThemedText variant="bodySmall" color="danger" style={{ marginBottom: spacing[2] }}>
          {result}
        </ThemedText>
      ) : null}
      <Button
        label="Submit review"
        size="sm"
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
      />
    </View>
  );
}

export default function OrderDetailScreen() {
  const { id } = useRoute<RouteProp<AppParamList, 'OrderDetail'>>().params;
  const navigation = useNavigation();
  const { colors, spacing } = useTheme();
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);
  const shipments = useOrderShipments(id);
  const cancelOrder = useCancelOrder(id ?? '');
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [reviewingVariantId, setReviewingVariantId] = useState<string | null>(null);

  if (isLoading) return <LoadingState label="Loading order…" />;
  if (isError || !order) return <ErrorState message={(error as Error)?.message ?? 'Order not found'} onRetry={() => refetch()} />;

  const canCancel = CANCELLABLE_STATUSES.has(order.fulfillmentStatus);
  const canReturn = order.fulfillmentStatus === 'delivered';

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
        <Card style={{ marginBottom: spacing[4] }}>
          <ThemedText variant="bodySmall" color="muted">
            Order #{order.id.slice(-8).toUpperCase()} · Placed {new Date(order.placedAt).toLocaleDateString()}
          </ThemedText>
          <View style={{ flexDirection: 'row', gap: spacing[3], marginTop: spacing[2] }}>
            <View>
              <ThemedText variant="caption" color="muted">
                Payment
              </ThemedText>
              <StatusBadge status={order.paymentStatus} />
            </View>
            <View>
              <ThemedText variant="caption" color="muted">
                Fulfillment
              </ThemedText>
              <StatusBadge status={order.fulfillmentStatus} />
            </View>
          </View>
        </Card>

        <Card style={{ marginBottom: spacing[4] }}>
          <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
            Items
          </ThemedText>
          {order.items.map((item, index) => (
            <View key={`${item.variantId}-${index}`} style={{ marginBottom: spacing[2], paddingBottom: spacing[2], borderBottomWidth: index < order.items.length - 1 ? 1 : 0, borderBottomColor: colors.borderSubtle }}>
              <ThemedText weight="medium">{item.name}</ThemedText>
              <ThemedText variant="bodySmall" color="muted">
                {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')} · Qty {item.quantity}
              </ThemedText>
              <ThemedText variant="bodySmall">{formatMoney(item.lineTotal)}</ThemedText>
              {order.fulfillmentStatus === 'delivered' ? (
                reviewingVariantId === item.variantId ? (
                  <ReviewForm orderId={order.id} orderItemVariantId={item.variantId} />
                ) : (
                  <Button
                    label="Write a review"
                    variant="ghost"
                    size="sm"
                    onPress={() => setReviewingVariantId(item.variantId)}
                    style={{ alignSelf: 'flex-start', marginTop: spacing[1] }}
                  />
                )
              ) : null}
            </View>
          ))}
        </Card>

        <Card style={{ marginBottom: spacing[4] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText color="muted">Subtotal</ThemedText>
            <ThemedText>{formatMoney(order.itemSubtotal)}</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText color="muted">Discount</ThemedText>
            <ThemedText>-{formatMoney(order.discountTotal)}</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText color="muted">Tax</ThemedText>
            <ThemedText>{formatMoney(order.taxTotal)}</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText color="muted">Shipping</ThemedText>
            <ThemedText>{formatMoney(order.shippingTotal)}</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing[2], paddingTop: spacing[2], borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>
            <ThemedText weight="bold">Total</ThemedText>
            <ThemedText weight="bold">{formatMoney(order.grandTotal)}</ThemedText>
          </View>
        </Card>

        <Card style={{ marginBottom: spacing[4] }}>
          <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
            Shipping address
          </ThemedText>
          <ThemedText>{order.shippingAddress.recipientName}</ThemedText>
          <ThemedText color="muted">
            {order.shippingAddress.addressLine1}, {order.shippingAddress.locality} {order.shippingAddress.postalCode}, {order.shippingAddress.countryCode}
          </ThemedText>
        </Card>

        {shipments.data && shipments.data.length > 0 ? (
          <Card style={{ marginBottom: spacing[4] }}>
            <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
              Tracking
            </ThemedText>
            {shipments.data.map((shipment) => (
              <View key={shipment.id} style={{ marginBottom: spacing[2] }}>
                <ThemedText weight="medium">
                  {shipment.carrier ?? 'Carrier TBD'} {shipment.trackingNumber ? `· ${shipment.trackingNumber}` : ''}
                </ThemedText>
                <StatusBadge status={shipment.status} />
                {shipment.trackingEvents.map((event, i) => (
                  <ThemedText key={i} variant="caption" color="muted">
                    {new Date(event.occurredAt).toLocaleString()} — {event.status.replace(/_/g, ' ')}
                  </ThemedText>
                ))}
              </View>
            ))}
          </Card>
        ) : null}

        <Card style={{ marginBottom: spacing[4] }}>
          <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
            Status history
          </ThemedText>
          {order.statusHistory.map((entry, i) => (
            <ThemedText key={i} variant="bodySmall" color="muted">
              {new Date(entry.changedAt).toLocaleString()} — {entry.track}: {entry.status.replace(/_/g, ' ')}
            </ThemedText>
          ))}
        </Card>

        {cancelError ? (
          <ThemedText color="danger" style={{ marginBottom: spacing[3] }}>
            {cancelError}
          </ThemedText>
        ) : null}

        {canCancel ? (
          <Button
            label="Cancel order"
            variant="danger"
            fullWidth
            loading={cancelOrder.isPending}
            onPress={() =>
              cancelOrder.mutate('Customer requested cancellation', {
                onError: (e) => setCancelError((e as Error).message)
              })
            }
            style={{ marginBottom: spacing[3] }}
          />
        ) : null}
        {canReturn ? (
          <Button
            label="Request a return"
            variant="outline"
            fullWidth
            onPress={() => navigation.navigate('NewReturn', { orderId: order.id })}
            style={{ marginBottom: spacing[3] }}
          />
        ) : null}
        <Button
          label="Ask Sphere AI about this order"
          variant="secondary"
          fullWidth
          onPress={() => navigation.navigate('AiChat', { mode: 'support', orderId: order.id })}
        />
      </ScrollView>
    </ThemedView>
  );
}
