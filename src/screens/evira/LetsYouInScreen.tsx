import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies, textSizes, textLineHeights } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { EviraButton, EviraDivider, EviraHeader, EviraSocialButton, Illustration } from '@/components/evira';
import { BagGlyph, GlobeGlyph, UserGlyph } from '@/components/ui/icons';

/** Kit screen 11. */
export default function LetsYouInScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  // The kit shows Facebook/Google/Apple. No OAuth provider is configured on
  // this backend yet, so these announce rather than pretend to sign in.
  const notConfigured = (provider: string) =>
    Alert.alert('Not configured', `${provider} sign-in is not wired to the backend yet.`);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <EviraHeader />
      <View style={styles.body}>
        <Illustration name="login" size={240} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>Let&rsquo;s you in</Text>

        <View style={styles.providers}>
          <EviraSocialButton
            label="Continue with Facebook"
            icon={<GlobeGlyph size={22} color={colors.textPrimary} />}
            onPress={() => notConfigured('Facebook')}
          />
          <EviraSocialButton
            label="Continue with Google"
            icon={<BagGlyph size={22} color={colors.textPrimary} />}
            onPress={() => notConfigured('Google')}
          />
          <EviraSocialButton
            label="Continue with Apple"
            icon={<UserGlyph size={22} color={colors.textPrimary} />}
            onPress={() => notConfigured('Apple')}
          />
        </View>

        <EviraDivider label="or" />

        <EviraButton
          label="Sign in with password"
          onPress={() => navigation.navigate('Login')}
          style={styles.cta}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don&rsquo;t have an account? </Text>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.footerLink, { color: colors.textPrimary }]}>Sign up</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, paddingHorizontal: 24 },
  title: { fontFamily: fontFamilies.black, fontSize: textSizes.heading, lineHeight: textLineHeights.heading, textAlign: 'center', marginTop: 32 },
  providers: { gap: 16, marginTop: 32 },
  cta: { marginTop: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  footerText: { fontFamily: fontFamilies.regular, fontSize: textSizes.description },
  footerLink: { fontFamily: fontFamilies.bold, fontSize: textSizes.description }
});
