import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore, useIsAuthenticated } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuthActions';
import { useNotifications } from '@/hooks/useNotifications';

function AccountLink({ label, badge, onPress }: { label: string; badge?: number; onPress: () => void }) {
  const { colors, spacing } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.borderSubtle
      }}
    >
      <ThemedText variant="body">{label}</ThemedText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
        {badge ? (
          <View style={{ backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
            <ThemedText variant="caption" style={{ color: colors.onAccent }}>
              {badge}
            </ThemedText>
          </View>
        ) : null}
        <ThemedText color="muted">›</ThemedText>
      </View>
    </Pressable>
  );
}

export default function AccountScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { spacing } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const notifications = useNotifications(true);
  const unreadCount = notifications.data?.data.length ?? 0;

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
        <ThemedText variant="title" style={{ marginBottom: spacing[4] }}>
          Account
        </ThemedText>

        {!isAuthenticated ? (
          <Card style={{ marginBottom: spacing[4] }}>
            <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
              You're browsing as a guest
            </ThemedText>
            <ThemedText color="muted" style={{ marginBottom: spacing[3] }}>
              Sign in to see your orders, wishlist, and checkout faster.
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              <Button label="Sign in" onPress={() => navigation.navigate('Login')} />
              <Button label="Create account" variant="outline" onPress={() => navigation.navigate('Register')} />
            </View>
          </Card>
        ) : (
          <Card style={{ marginBottom: spacing[4] }}>
            <ThemedText variant="heading">{user?.displayName ?? user?.email ?? 'Customer'}</ThemedText>
            <ThemedText color="muted">{user?.email}</ThemedText>
          </Card>
        )}

        {isAuthenticated ? <AccountLink label="Order history" onPress={() => navigation.navigate('Orders')} /> : null}
        <AccountLink label="Wishlist" onPress={() => navigation.navigate('Wishlist')} />
        <AccountLink label="Recently viewed" onPress={() => navigation.navigate('RecentlyViewed')} />
        {isAuthenticated ? <AccountLink label="Addresses" onPress={() => navigation.navigate('Addresses')} /> : null}
        {isAuthenticated ? <AccountLink label="Notifications" badge={unreadCount} onPress={() => navigation.navigate('Settings')} /> : null}
        <AccountLink label="Support" onPress={() => navigation.navigate('Support')} />
        <AccountLink label="Sphere AI" onPress={() => navigation.navigate('AiChat')} />
        <AccountLink label="Settings" onPress={() => navigation.navigate('Settings')} />

        {isAuthenticated ? (
          <Button label="Log out" variant="ghost" onPress={() => logout.mutate()} loading={logout.isPending} style={{ marginTop: spacing[6] }} />
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}
