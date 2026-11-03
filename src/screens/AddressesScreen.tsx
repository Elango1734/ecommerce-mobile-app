import React from 'react';
import { FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { useAddresses, useDeleteAddress } from '@/hooks/useAddresses';

export default function AddressesScreen() {
  const navigation = useNavigation();
  const { spacing } = useTheme();
  const { data, isLoading, isError, error, refetch } = useAddresses();
  const deleteAddress = useDeleteAddress();

  if (isLoading) return <LoadingState label="Loading addresses…" />;
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;
  if (!data || data.length === 0) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState title="No addresses yet" actionLabel="Add an address" onAction={() => navigation.navigate('AddAddress')} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing[4], gap: spacing[3] }}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText weight="semibold">{item.fields.recipientName}</ThemedText>
              {item.isDefault ? <ThemedText variant="caption" color="accent">Default</ThemedText> : null}
            </View>
            <ThemedText color="muted">
              {item.fields.addressLine1}
              {item.fields.addressLine2 ? `, ${item.fields.addressLine2}` : ''}, {item.fields.locality} {item.fields.postalCode}, {item.fields.countryCode}
            </ThemedText>
            <Button label="Remove" variant="ghost" size="sm" onPress={() => deleteAddress.mutate(item.id)} style={{ alignSelf: 'flex-start', marginTop: spacing[2] }} />
          </Card>
        )}
        ListFooterComponent={<Button label="Add a new address" onPress={() => navigation.navigate('AddAddress')} style={{ marginTop: spacing[2] }} />}
      />
    </ThemedView>
  );
}
