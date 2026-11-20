import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@shopsphere/validation';
import { fontFamilies, textSizes, textLineHeights } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { ControlledTextInput } from '@/components/ui/ControlledTextInput';
import { EviraButton } from '@/components/evira';
import { LockGlyph, MailGlyph, UserGlyph } from '@/components/ui/icons';
import { useRegister } from '@/hooks/useAuthActions';
import { ApiClientError } from '@shopsphere/api-client';
import type { AppParamList } from '@/navigation/types';

/** Kit screens 12-14 (sign up). */
export default function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppParamList>>();
  const { colors } = useTheme();
  const registerMutation = useRegister();
  const { control, handleSubmit, setError } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', displayName: '' }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync(values);
      navigation.goBack();
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : 'Unable to create your account right now.';
      setError('email', { message });
    }
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedText style={[styles.title, { color: colors.textPrimary }]}>Create your Account</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          Public registration only ever creates a customer account.
        </ThemedText>

        <View style={styles.fields}>
          <ControlledTextInput control={control} name="displayName" label="Full name" leading={<UserGlyph size={20} color={colors.textMuted} />} />
          <ControlledTextInput control={control} name="email" label="Email" keyboardType="email-address" leading={<MailGlyph size={20} color={colors.textMuted} />} />
          <ControlledTextInput control={control} name="password" label="Password" secureTextEntry leading={<LockGlyph size={20} color={colors.textMuted} />} />
        </View>

        <EviraButton label="Create Account" loading={registerMutation.isPending} onPress={onSubmit} style={styles.cta} />

        <View style={styles.footer}>
          <ThemedText style={{ fontFamily: fontFamilies.regular, fontSize: textSizes.description, color: colors.textSecondary }}>Already have an account? </ThemedText>
          <Pressable onPress={() => navigation.replace('Login')}>
            <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: textSizes.description, color: colors.textPrimary }}>Sign in</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  title: { fontFamily: fontFamilies.black, fontSize: textSizes.heading, lineHeight: textLineHeights.heading, marginBottom: 8 },
  subtitle: { fontFamily: fontFamilies.medium, fontSize: textSizes.description, lineHeight: textLineHeights.description, marginBottom: 28 },
  fields: { gap: 4 },
  cta: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 }
});
