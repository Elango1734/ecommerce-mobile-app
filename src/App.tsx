import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { fontFamilies } from '@shopsphere/config';
import { NavigationContainer } from '@react-navigation/native';
import { queryClient } from '@/api/queryClient';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import { useGuestStore } from '@/stores/guestStore';
import { RootNavigator } from '@/navigation/RootNavigator';

function NavigationRoot() {
  const { resolvedScheme, colors } = useTheme();
  return (
    <>
      <StatusBar barStyle={resolvedScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <NavigationContainer
        theme={{
          dark: resolvedScheme === 'dark',
          colors: {
            // React Navigation's `primary` is a tint (header back chevrons and
            // the like), not a background — and the tab bar is a custom
            // `tabBar`, so nothing here paints it. Required by the Theme type.
            primary: colors.accent,
            background: colors.background,
            card: colors.surface,
            text: colors.textPrimary,
            border: colors.borderSubtle,
            notification: colors.accent,
          },
          fonts: {
            regular: { fontFamily: fontFamilies.regular, fontWeight: '400' },
            medium: { fontFamily: fontFamilies.medium, fontWeight: '500' },
            bold: { fontFamily: fontFamilies.bold, fontWeight: '700' },
            heavy: { fontFamily: fontFamilies.black, fontWeight: '900' }
          }
        }}
      >
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

/**
 * Gates the whole app on two cheap, local hydration steps — restoring a
 * session from the Keychain/Keystore-backed refresh token and loading or
 * minting the guest identifier — before rendering anything, so no screen
 * ever has to handle "auth state not loaded yet" as a separate case.
 */
export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    Promise.all([useAuthStore.getState().hydrate(), useGuestStore.getState().hydrate()])
      .catch(() => undefined)
      .finally(() => setIsReady(true));
  }, []);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <NavigationRoot />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
