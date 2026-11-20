import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@shopsphere/validation';
import { fontFamilies, textSizes, textLineHeights } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { ControlledTextInput } from '@/components/ui/ControlledTextInput';
import { EviraButton, EviraDivider, EviraSocialButton } from '@/components/evira';
import { BagGlyph, CheckGlyph, GlobeGlyph, MailGlyph, LockGlyph, UserGlyph } from '@/components/ui/icons';
import { useLogin } from '@/hooks/useAuthActions';
import { ApiClientError } from '@shopsphere/api-client';
import type { AppParamList } from '@/navigation/types';

/** Kit screens 15-17 (sign in). */
export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppParamList>>();
  const { colors } = useTheme();
  const login = useLogin();
  const [remember, setRemember] = useState(false);
  const { control, handleSubmit, setError } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      navigation.goBack();
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : 'Unable to sign in right now.';
      setError('password', { message });
    }
  });

  const notConfigured = (provider: string) => Alert.alert('Not configured', `${provider} sign-in is not wired to the backend yet.`);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedText style={[styles.title, { color: colors.textPrimary }]}>Login to your Account</ThemedText>

        <View style={styles.fields}>
          <ControlledTextInput
            control={control}
            name="email"
            label="Email"
            keyboardType="email-address"
            leading={<MailGlyph size={20} color={colors.textMuted} />}
          />
          <ControlledTextInput
            control={control}
            name="password"
            label="Password"
            secureTextEntry
            leading={<LockGlyph size={20} color={colors.textMuted} />}
          />
        </View>

        <View style={styles.optionsRow}>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: remember }} onPress={() => setRemember((r) => !r)} style={styles.rememberRow}>
            <View style={[styles.checkbox, { borderColor: colors.accent, backgroundColor: remember ? colors.accent : 'transparent' }]}>
              {remember ? <CheckGlyph size={12} color={colors.onAccent} /> : null}
            </View>
            <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: textSizes.description, color: colors.textPrimary }}>Remember me</ThemedText>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
            <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: textSizes.description, color: colors.textPrimary }}>Forgot the password?</ThemedText>
          </Pressable>
        </View>

        <EviraButton label="Sign in" loading={login.isPending} onPress={onSubmit} style={styles.signIn} />

        <View style={styles.dividerWrap}>
          <EviraDivider label="or continue with" />
        </View>

        <View style={styles.socials}>
          <EviraSocialButton label="Continue with Facebook" icon={<GlobeGlyph size={22} color={colors.textPrimary} />} onPress={() => notConfigured('Facebook')} />
          <EviraSocialButton label="Continue with Google" icon={<BagGlyph size={22} color={colors.textPrimary} />} onPress={() => notConfigured('Google')} />
          <EviraSocialButton label="Continue with Apple" icon={<UserGlyph size={22} color={colors.textPrimary} />} onPress={() => notConfigured('Apple')} />
        </View>

        <View style={styles.footer}>
          <ThemedText style={{ fontFamily: fontFamilies.regular, fontSize: textSizes.description, color: colors.textSecondary }}>Don&rsquo;t have an account? </ThemedText>
          <Pressable onPress={() => navigation.replace('Register')}>
            <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: textSizes.description, color: colors.textPrimary }}>Sign up</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  title: { fontFamily: fontFamilies.black, fontSize: textSizes.heading, lineHeight: textLineHeights.heading, marginBottom: 28 },
  fields: { gap: 4 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  signIn: {},
  dividerWrap: { marginTop: 28, marginBottom: 20 },
  socials: { gap: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 }
});
