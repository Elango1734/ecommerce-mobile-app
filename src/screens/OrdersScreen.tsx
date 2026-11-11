import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { EviraHeader } from '@/components/evira';
import { ChevronRightGlyph, PackageGlyph } from '@/components/ui/icons';
import { useOrders } from '@/hooks/useOrders';
import { useIsAuthenticated } from '@/stores/authStore';
import { formatMoney } from '@/utils/money';
import type { OrderSummaryDto } from '@shopsphere/api-client';

const TERMINAL: ReadonlySet<string> = new Set(['delivered', 'cancelled', 'returned']);

/** Kit screens 66-70: ongoing/completed tabs over the same order list. */
export default function OrdersScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const { data, isLoading, isError, error, refetch } = useOrders();
  const [tab, setTab] = useState<'ongoing' | 'completed'>('ongoing');

  const { ongoing, completed } = useMemo(() => {
    const all = data?.data ?? [];
    return {
      ongoing: all.filter((o) => !TERMINAL.has(o.fulfillmentStatus)),
      completed: all.filter((o) => TERMINAL.has(o.fulfillmentStatus))
    };
  }, [data]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
        <EmptyState illustration="login" title="Sign in to see your orders" actionLabel="Sign in" onAction={() => navigation.navigate('Login')} />
      </SafeAreaView>
    );
  }

  if (isLoading) return <LoadingState label="Loading orders…" />;
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;

  const list = tab === 'ongoing' ? ongoing : completed;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <EviraHeader title="My Orders" />
      <View style={styles.tabs}>
        {(['ongoing', 'completed'] as const).map((key) => {
          const active = tab === key;
          return (
            <Pressable key={key} onPress={() => setTab(key)} style={styles.tabButton}>
              <ThemedText style={{ fontFamily: active ? fontFamilies.bold : fontFamilies.medium, fontSize: 16, color: active ? colors.textPrimary : colors.textMuted }}>
                {key === 'ongoing' ? 'Ongoing' : 'Completed'}
              </ThemedText>
              <View style={[styles.tabUnderline, { backgroundColor: active ? colors.accent : 'transparent' }]} />
            </Pressable>
          );
        })}
      </View>

      {list.length === 0 ? (
        <EmptyState
          illustration="empty"
          title={tab === 'ongoing' ? 'No ongoing orders' : 'No completed orders'}
          message="Your order history will show up here."
          actionLabel="Start shopping"
          onAction={() => navigation.navigate('Search')}
        />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: { item: OrderSummaryDto }) => (
            <Pressable onPress={() => navigation.navigate('OrderDetail', { id: item.id })} style={[styles.card, { backgroundColor: colors.surfaceSunken }]}>
              <View style={[styles.cardIcon, { backgroundColor: colors.surface }]}>
                <PackageGlyph size={24} color={colors.textPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.orderId, { color: colors.textPrimary }]}>
                  Order #{item.id.slice(-8).toUpperCase()}
                </ThemedText>
                <ThemedText style={[styles.orderMeta, { color: colors.textMuted }]}>
                  {new Date(item.placedAt).toLocaleDateString()} · {item.itemCount} item{item.itemCount === 1 ? '' : 's'}
                </ThemedText>
                <View style={styles.badgeRow}>
                  <StatusBadge status={item.fulfillmentStatus} />
                  <StatusBadge status={item.paymentStatus} />
                </View>
              </View>
              <View style={styles.cardRight}>
                <ThemedText style={[styles.price, { color: colors.textPrimary }]}>{formatMoney(item.grandTotal)}</ThemedText>
                <ChevronRightGlyph size={18} color={colors.textMuted} />
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabs: { flexDirection: 'row', gap: 28, paddingHorizontal: 24, marginTop: 4, marginBottom: 12 },
  tabButton: { alignItems: 'center', gap: 8, paddingBottom: 8 },
  tabUnderline: { height: 3, width: 32, borderRadius: 2 },
  listContent: { paddingHorizontal: 24, paddingBottom: 24, gap: 14 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 20, padding: 16 },
  cardIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  orderId: { fontFamily: fontFamilies.bold, fontSize: 15 },
  orderMeta: { fontFamily: fontFamilies.medium, fontSize: 13, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  price: { fontFamily: fontFamilies.bold, fontSize: 15 }
});
