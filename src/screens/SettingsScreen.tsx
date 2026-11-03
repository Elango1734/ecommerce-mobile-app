import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/states';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/useNotifications';
import { useIsAuthenticated } from '@/stores/authStore';

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
];

export default function SettingsScreen() {
  const { colors, spacing, radii, preference, setPreference } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
        <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
          Appearance
        </ThemedText>
        <View style={{ flexDirection: 'row', gap: spacing[2], marginBottom: spacing[5] }}>
          {THEME_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              style={{
                flex: 1,
                paddingVertical: spacing[3],
                borderRadius: radii.md,
                alignItems: 'center',
                backgroundColor: preference === option.value ? colors.accent : colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.borderSubtle
              }}
            >
              <ThemedText style={{ color: preference === option.value ? colors.onAccent : colors.textPrimary }}>{option.label}</ThemedText>
            </Pressable>
          ))}
        </View>

        {isAuthenticated ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] }}>
              <ThemedText variant="heading">Notifications</ThemedText>
              <Button label="Mark all read" variant="ghost" size="sm" onPress={() => markAllRead.mutate()} />
            </View>
            {notifications.isLoading ? (
              <LoadingState label="Loading notifications…" />
            ) : (notifications.data?.data.length ?? 0) === 0 ? (
              <ThemedText color="muted" style={{ marginBottom: spacing[5] }}>
                No notifications yet.
              </ThemedText>
            ) : (
              notifications.data!.data.map((n) => (
                <Pressable key={n.id} onPress={() => !n.readAt && markRead.mutate(n.id)}>
                  <Card style={{ marginBottom: spacing[2], opacity: n.readAt ? 0.6 : 1 }}>
                    <ThemedText weight="semibold">{n.title}</ThemedText>
                    {n.body ? <ThemedText color="muted">{n.body}</ThemedText> : null}
                  </Card>
                </Pressable>
              ))
            )}
          </>
        ) : null}

        <ThemedText variant="heading" style={{ marginTop: spacing[5], marginBottom: spacing[2] }}>
          Privacy
        </ThemedText>
        <ThemedText color="muted">
          Sphere AI conversation history can be deleted from within any chat screen. For account data export or deletion requests, contact
          support — self-service account deletion is not available in this build.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}
