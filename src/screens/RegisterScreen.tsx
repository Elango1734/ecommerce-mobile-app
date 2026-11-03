import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@shopsphere/validation';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Button } from '@/components/ui/Button';
import { ControlledTextInput } from '@/components/ui/ControlledTextInput';
import { useRegister } from '@/hooks/useAuthActions';
import { ApiClientError } from '@shopsphere/api-client';
import type { AppParamList } from '@/navigation/types';

export default function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppParamList>>();
  const { spacing } = useTheme();
  const registerMutation = useRegister();
  const {
    control,
    handleSubmit,
    setError
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema), defaultValues: { email: '', password: '', displayName: '' } });

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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing[5] }} keyboardShouldPersistTaps="handled">
          <ThemedText variant="title" style={{ marginBottom: spacing[1] }}>
            Create your account
          </ThemedText>
          <ThemedText color="muted" style={{ marginBottom: spacing[6] }}>
            Public registration only ever creates a customer account.
          </ThemedText>

          <ControlledTextInput control={control} name="displayName" label="Name" />
          <ControlledTextInput control={control} name="email" label="Email" keyboardType="email-address" />
          <ControlledTextInput control={control} name="password" label="Password" secureTextEntry />

          <Button label="Create account" fullWidth loading={registerMutation.isPending} onPress={onSubmit} />
          <Button label="Already have an account? Sign in" variant="ghost" fullWidth onPress={() => navigation.replace('Login')} style={{ marginTop: spacing[3] }} />
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
