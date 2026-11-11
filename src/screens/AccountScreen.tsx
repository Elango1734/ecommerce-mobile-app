import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { EviraButton } from '@/components/evira';
import {
  ChevronRightGlyph,
  ClockGlyph,
  HeartGlyph,
  HelpCircleGlyph,
  LogOutGlyph,
  MapPinGlyph,
  MessageGlyph,
  PackageGlyph,
  BellGlyph,
  GearGlyph,
  UserGlyph,
  type GlyphProps
} from '@/components/ui/icons';
import { useAuthStore, useIsAuthenticated } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuthActions';
import { useNotifications } from '@/hooks/useNotifications';
import type { AppParamList } from '@/navigation/types';

function AccountRow({
  icon: Icon,
  label,
  badge,
  onPress
}: {
  icon: React.ComponentType<GlyphProps>;
  label: string;
  badge?: number;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.row, { borderBottomColor: colors.borderSubtle }]}>
      <View style={[styles.rowIcon, { backgroundColor: colors.surfaceSunken }]}>
        <Icon size={20} color={colors.textPrimary} />
      </View>
      <ThemedText style={[styles.rowLabel, { color: colors.textPrimary }]}>{label}</ThemedText>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: 11, color: colors.onAccent }}>{badge}</ThemedText>
        </View>
      ) : null}
      <ChevronRightGlyph size={20} color={colors.textMuted} />
    </Pressable>
  );
}

/** Kit screen 79 ("profile & settings"). */
export default function AccountScreen() {
  const navigation = useNavigation<import('@react-navigation/native').NavigationProp<AppParamList>>();
  const { colors } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const notifications = useNotifications(true);
  const unreadCount = notifications.data?.data.length ?? 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.title, { color: colors.textPrimary }]}>Profile</ThemedText>

        {!isAuthenticated ? (
          <View style={[styles.guestCard, { backgroundColor: colors.surfaceSunken }]}>
            <ThemedText style={[styles.guestTitle, { color: colors.textPrimary }]}>You&rsquo;re browsing as a guest</ThemedText>
            <ThemedText style={[styles.guestBody, { color: colors.textSecondary }]}>
              Sign in to see your orders, wishlist, and checkout faster.
            </ThemedText>
            <View style={styles.guestActions}>
              <EviraButton label="Sign in" onPress={() => navigation.navigate('Login')} style={styles.guestButton} />
              <EviraButton label="Create account" variant="outline" onPress={() => navigation.navigate('Register')} style={styles.guestButton} />
            </View>
          </View>
        ) : (
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: colors.surfaceSunken }]}>
              <UserGlyph size={28} color={colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText numberOfLines={1} style={[styles.name, { color: colors.textPrimary }]}>
                {user?.displayName ?? user?.email ?? 'Customer'}
              </ThemedText>
              <ThemedText numberOfLines={1} style={[styles.email, { color: colors.textSecondary }]}>
                {user?.email}
              </ThemedText>
            </View>
          </View>
        )}

        <View style={styles.section}>
          {isAuthenticated ? <AccountRow icon={PackageGlyph} label="Order history" onPress={() => navigation.navigate('Orders')} /> : null}
          <AccountRow icon={HeartGlyph} label="Wishlist" onPress={() => navigation.navigate('Wishlist')} />
          <AccountRow icon={ClockGlyph} label="Recently viewed" onPress={() => navigation.navigate('RecentlyViewed')} />
          {isAuthenticated ? <AccountRow icon={MapPinGlyph} label="Addresses" onPress={() => navigation.navigate('Addresses')} /> : null}
          {isAuthenticated ? (
            <AccountRow icon={BellGlyph} label="Notifications" badge={unreadCount} onPress={() => navigation.navigate('Settings')} />
          ) : null}
          <AccountRow icon={HelpCircleGlyph} label="Support" onPress={() => navigation.navigate('Support')} />
          <AccountRow icon={MessageGlyph} label="Sphere AI" onPress={() => navigation.navigate('AiChat')} />
          <AccountRow icon={GearGlyph} label="Settings" onPress={() => navigation.navigate('Settings')} />
        </View>

        {isAuthenticated ? (
          <Pressable accessibilityRole="button" onPress={() => logout.mutate()} style={styles.logout}>
            <LogOutGlyph size={20} color={colors.danger} />
            <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: 16, color: colors.danger }}>
              {logout.isPending ? 'Logging out…' : 'Log out'}
            </ThemedText>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  title: { fontFamily: fontFamilies.bold, fontSize: 24, lineHeight: 29, marginBottom: 20 },
  guestCard: { borderRadius: 20, padding: 20, marginBottom: 12 },
  guestTitle: { fontFamily: fontFamilies.bold, fontSize: 18, marginBottom: 8 },
  guestBody: { fontFamily: fontFamilies.medium, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  guestActions: { flexDirection: 'row', gap: 12 },
  guestButton: { flex: 1, height: 50 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: fontFamilies.bold, fontSize: 18 },
  email: { fontFamily: fontFamilies.medium, fontSize: 14, marginTop: 2 },
  section: { marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderBottomWidth: 1 },
  rowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontFamily: fontFamilies.semibold, fontSize: 16 },
  badge: { borderRadius: 100, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, marginRight: 4 },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 28, paddingVertical: 12 }
});
