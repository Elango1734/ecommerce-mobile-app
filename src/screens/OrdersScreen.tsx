import React from 'react';
import { FlatList, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { useOrders } from '@/hooks/useOrders';
import { useIsAuthenticated } from '@/stores/authStore';
import { formatMoney } from '@/utils/money';

export default function OrdersScreen() {
  const navigation = useNavigation();
  const { spacing } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const { data, isLoading, isError, error, refetch } = useOrders();

  if (!isAuthenticated) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState title="Sign in to see your orders" actionLabel="Sign in" onAction={() => navigation.navigate('Login')} />
      </ThemedView>
    );
  }

  if (isLoading) return <LoadingState label="Loading orders…" />;
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;
  if (!data || data.data.length === 0) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState title="No orders yet" message="Your order history will show up here." actionLabel="Start shopping" onAction={() => navigation.navigate('Search')} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        data={data.data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing[4], gap: spacing[3] }}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('OrderDetail', { id: item.id })}>
            <Card>
              <ThemedText variant="bodySmall" color="muted">
                Placed {new Date(item.placedAt).toLocaleDateString()} · {item.itemCount} item{item.itemCount === 1 ? '' : 's'}
              </ThemedText>
              <ThemedText variant="heading" style={{ marginVertical: spacing[1] }}>
                {formatMoney(item.grandTotal)}
              </ThemedText>
              <ThemedText variant="bodySmall" color="muted" style={{ marginBottom: spacing[2] }}>
                Order #{item.id.slice(-8).toUpperCase()}
              </ThemedText>
              <ThemedText variant="caption" color="muted">
                Payment
              </ThemedText>
              <StatusBadge status={item.paymentStatus} />
              <ThemedText variant="caption" color="muted" style={{ marginTop: spacing[2] }}>
                Fulfillment
              </ThemedText>
              <StatusBadge status={item.fulfillmentStatus} />
            </Card>
          </Pressable>
        )}
      />
    </ThemedView>
  );
}
