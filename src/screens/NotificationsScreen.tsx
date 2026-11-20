import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NotificationDto } from '@shopsphere/api-client';
import { fontFamilies, textSizes, textLineHeights } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { EviraHeader } from '@/components/evira';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { BellGlyph, MessageGlyph, MoreGlyph, PackageGlyph, TagGlyph, type GlyphProps } from '@/components/ui/icons';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/useNotifications';
import { useIsAuthenticated } from '@/stores/authStore';

/**
 * The home screen's bell used to open Settings, which is simply the wrong
 * destination — this is where it goes now. The notification feed already had
 * a full API (`GET /notifications`, `POST /notifications/:id/read`,
 * `POST /notifications/read-all`) and hooks; only the screen was missing.
 */

/** The backend's `type` is an open string, so match on keyword rather than a closed union. */
function notificationIcon(type: string): React.ComponentType<GlyphProps> {
  const key = type.toLowerCase();
  if (/order|ship|deliver|return/.test(key)) return PackageGlyph;
  if (/promo|price|deal|offer|discount/.test(key)) return TagGlyph;
  if (/support|ticket|message|reply/.test(key)) return MessageGlyph;
  return BellGlyph;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (!Number.isFinite(minutes) || minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** `data` is typed `unknown` on the wire, so narrow before trusting a deep link out of it. */
function orderIdFrom(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'orderId' in data) {
    const value = (data as { orderId: unknown }).orderId;
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const isAuthenticated = useIsAuthenticated();
  const { data, isLoading, isFetching, isError, error, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
        <EviraHeader title="Notifications" />
        <EmptyState
          illustration="login"
          title="Sign in for notifications"
          message="Order updates and replies to your questions land here once you have an account."
          actionLabel="Sign in"
          onAction={() => navigation.navigate('Login')}
        />
      </SafeAreaView>
    );
  }

  const items = data?.data ?? [];
  const unreadCount = items.filter((item) => !item.readAt).length;

  function onPressNotification(item: NotificationDto) {
    if (!item.readAt) markRead.mutate(item.id);
    const orderId = orderIdFrom(item.data);
    if (orderId) navigation.navigate('OrderDetail', { id: orderId });
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <EviraHeader
        title="Notifications"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notification options"
            hitSlop={8}
            onPress={() => setMenuOpen(true)}
          >
            <MoreGlyph size={22} color={colors.textPrimary} />
          </Pressable>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading notifications…" />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          illustration="empty"
          title="No notifications yet"
          message="Order updates, replies and price drops will show up here."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl tintColor={colors.accent} refreshing={isFetching} onRefresh={() => refetch()} />}
          renderItem={({ item }) => {
            const Icon = notificationIcon(item.type);
            const unread = !item.readAt;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={unread ? `Unread: ${item.title}` : item.title}
                onPress={() => onPressNotification(item)}
                style={[styles.row, { backgroundColor: unread ? colors.surfaceSunken : 'transparent' }]}
              >
                <View style={[styles.icon, { backgroundColor: unread ? colors.surface : colors.surfaceSunken }]}>
                  <Icon size={20} color={colors.textPrimary} />
                </View>
                <View style={styles.copy}>
                  <ThemedText numberOfLines={2} style={[styles.title, { color: colors.textPrimary }]}>
                    {item.title}
                  </ThemedText>
                  {item.body ? (
                    <ThemedText numberOfLines={2} style={[styles.body, { color: colors.textSecondary }]}>
                      {item.body}
                    </ThemedText>
                  ) : null}
                  <ThemedText style={[styles.time, { color: colors.textMuted }]}>{relativeTime(item.createdAt)}</ThemedText>
                </View>
                {unread ? <View style={[styles.dot, { backgroundColor: colors.accent }]} /> : null}
              </Pressable>
            );
          }}
        />
      )}
      <ActionMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Notifications"
        items={[
          {
            label: unreadCount > 0 ? `Mark all ${unreadCount} as read` : 'Mark all as read',
            onPress: () => markAllRead.mutate(),
            disabled: unreadCount === 0 || markAllRead.isPending
          },
          { label: 'Refresh', onPress: () => refetch() }
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 16, padding: 12 },
  icon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 3 },
  title: { fontFamily: fontFamilies.bold, fontSize: textSizes.normal, lineHeight: textLineHeights.normal },
  body: { fontFamily: fontFamilies.medium, fontSize: textSizes.description, lineHeight: textLineHeights.description },
  time: { fontFamily: fontFamilies.medium, fontSize: textSizes.description, lineHeight: textLineHeights.description, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 }
});
