import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAddressSchema, type AddressFieldsInput } from '@shopsphere/validation';
import { z } from 'zod';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Button } from '@/components/ui/Button';
import { ControlledTextInput } from '@/components/ui/ControlledTextInput';
import { useCreateAddress } from '@/hooks/useAddresses';
import { ApiClientError } from '@shopsphere/api-client';

type FormValues = z.infer<typeof createAddressSchema>;

export default function AddAddressScreen() {
  const navigation = useNavigation();
  const { spacing } = useTheme();
  const createAddress = useCreateAddress();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(createAddressSchema),
    defaultValues: {
      label: 'home',
      isDefault: true,
      fields: {
        recipientName: '',
        addressLine1: '',
        locality: '',
        postalCode: '',
        countryCode: 'US'
      } as AddressFieldsInput
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await createAddress.mutateAsync(values);
      navigation.goBack();
    } catch (error) {
      setSubmitError(error instanceof ApiClientError ? error.message : 'Unable to save this address.');
    }
  });

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing[5] }} keyboardShouldPersistTaps="handled">
        <ControlledTextInput control={control} name="fields.recipientName" label="Recipient name" />
        <ControlledTextInput control={control} name="fields.addressLine1" label="Address line 1" />
        <ControlledTextInput control={control} name="fields.addressLine2" label="Address line 2 (optional)" />
        <ControlledTextInput control={control} name="fields.locality" label="City" />
        <ControlledTextInput control={control} name="fields.region" label="State / region (optional)" />
        <ControlledTextInput control={control} name="fields.postalCode" label="Postal code" />
        <ControlledTextInput control={control} name="fields.countryCode" label="Country code (e.g. US)" autoCapitalize="none" />
        <ControlledTextInput control={control} name="fields.phone" label="Phone (optional)" />

        {submitError ? (
          <ThemedText color="danger" style={{ marginBottom: spacing[3] }}>
            {submitError}
          </ThemedText>
        ) : null}

        <Button label="Save address" fullWidth loading={createAddress.isPending} onPress={onSubmit} />
      </ScrollView>
    </ThemedView>
  );
}
