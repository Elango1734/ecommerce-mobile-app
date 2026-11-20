import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies, textSizes, textLineHeights } from '@shopsphere/config';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { LoadingState } from '@/components/ui/states';
import { EviraHeader } from '@/components/evira';
import { BellGlyph, CheckGlyph } from '@/components/ui/icons';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/useNotifications';
import { useIsAuthenticated } from '@/stores/authStore';

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
];

/** Kit screen 83 (notifications) combined with the appearance toggle and privacy note. */
export default function SettingsScreen() {
  const { colors, preference, setPreference } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <EviraHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Appearance</ThemedText>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((option) => {
            const active = preference === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setPreference(option.value)}
                style={[styles.themeChip, { backgroundColor: active ? colors.accent : colors.surfaceSunken }]}
              >
                <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: textSizes.description, color: active ? colors.onAccent : colors.textPrimary }}>
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {isAuthenticated ? (
          <>
            <View style={[styles.sectionHeader, { marginTop: 28 }]}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Notifications</ThemedText>
              <Pressable onPress={() => markAllRead.mutate()}>
                <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: textSizes.description, color: colors.accent }}>Mark all read</ThemedText>
              </Pressable>
            </View>
            {notifications.isLoading ? (
              <LoadingState label="Loading notifications…" />
            ) : (notifications.data?.data.length ?? 0) === 0 ? (
              <ThemedText style={{ fontFamily: fontFamilies.medium, color: colors.textMuted, marginTop: 8 }}>No notifications yet.</ThemedText>
            ) : (
              notifications.data!.data.map((n) => (
                <Pressable
                  key={n.id}
                  onPress={() => !n.readAt && markRead.mutate(n.id)}
                  style={[styles.notifRow, { backgroundColor: colors.surfaceSunken, opacity: n.readAt ? 0.55 : 1 }]}
                >
                  <View style={[styles.notifIcon, { backgroundColor: colors.surface }]}>
                    {n.readAt ? <CheckGlyph size={18} color={colors.textMuted} /> : <BellGlyph size={18} color={colors.textPrimary} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: textSizes.normal, color: colors.textPrimary }}>{n.title}</ThemedText>
                    {n.body ? (
                      <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: textSizes.description, color: colors.textSecondary, marginTop: 2 }}>{n.body}</ThemedText>
                    ) : null}
                  </View>
                </Pressable>
              ))
            )}
          </>
        ) : null}

        <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 28 }]}>Privacy</ThemedText>
        <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: textSizes.description, lineHeight: textLineHeights.description, color: colors.textSecondary }}>
          Sphere AI conversation history can be deleted from within any chat screen. For account data export or deletion requests, contact
          support — self-service account deletion is not available in this build.
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  sectionTitle: { fontFamily: fontFamilies.bold, fontSize: textSizes.title, marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  themeRow: { flexDirection: 'row', gap: 10 },
  themeChip: { flex: 1, height: 46, borderRadius: 100, alignItems: 'center', justifyContent: 'center' },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 14, marginTop: 10 },
  notifIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }
});
