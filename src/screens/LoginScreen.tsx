import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@shopsphere/validation';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Button } from '@/components/ui/Button';
import { ControlledTextInput } from '@/components/ui/ControlledTextInput';
import { useLogin } from '@/hooks/useAuthActions';
import { ApiClientError } from '@shopsphere/api-client';
import type { AppParamList } from '@/navigation/types';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppParamList>>();
  const { spacing } = useTheme();
  const login = useLogin();
  const {
    control,
    handleSubmit,
    setError
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      navigation.goBack();
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : 'Unable to sign in right now.';
      setError('password', { message });
    }
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing[5] }} keyboardShouldPersistTaps="handled">
          <ThemedText variant="title" style={{ marginBottom: spacing[1] }}>
            Welcome back
          </ThemedText>
          <ThemedText color="muted" style={{ marginBottom: spacing[6] }}>
            Sign in to check out and track your orders.
          </ThemedText>

          <ControlledTextInput control={control} name="email" label="Email" keyboardType="email-address" />
          <ControlledTextInput control={control} name="password" label="Password" secureTextEntry />

          <Button label="Sign in" fullWidth loading={login.isPending} onPress={onSubmit} />
          <Button label="Create an account instead" variant="ghost" fullWidth onPress={() => navigation.replace('Register')} style={{ marginTop: spacing[3] }} />
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
