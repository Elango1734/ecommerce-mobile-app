import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { EviraButton, EviraHeader } from '@/components/evira';
import { MapPinGlyph, TrashGlyph } from '@/components/ui/icons';
import { useAddresses, useDeleteAddress } from '@/hooks/useAddresses';

/** Kit screen 81. */
export default function AddressesScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { data, isLoading, isError, error, refetch } = useAddresses();
  const deleteAddress = useDeleteAddress();

  if (isLoading) return <LoadingState label="Loading addresses…" />;
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;
  if (!data || data.length === 0) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
        <EviraHeader title="Addresses" />
        <EmptyState title="No addresses yet" actionLabel="Add an address" onAction={() => navigation.navigate('AddAddress')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <EviraHeader title="Addresses" />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surfaceSunken }]}>
            <View style={[styles.icon, { backgroundColor: colors.surface }]}>
              <MapPinGlyph size={20} color={colors.textPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: 15, color: colors.textPrimary }}>{item.fields.recipientName}</ThemedText>
                {item.isDefault ? (
                  <View style={[styles.defaultPill, { backgroundColor: colors.accent }]}>
                    <ThemedText style={{ fontFamily: fontFamilies.bold, fontSize: 11, color: colors.onAccent }}>Default</ThemedText>
                  </View>
                ) : null}
              </View>
              <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
                {item.fields.addressLine1}
                {item.fields.addressLine2 ? `, ${item.fields.addressLine2}` : ''}, {item.fields.locality} {item.fields.postalCode}, {item.fields.countryCode}
              </ThemedText>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Remove address" hitSlop={10} onPress={() => deleteAddress.mutate(item.id)}>
              <TrashGlyph size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        )}
        ListFooterComponent={<EviraButton label="Add a new address" onPress={() => navigation.navigate('AddAddress')} style={{ marginTop: 8 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingBottom: 24, gap: 14 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, borderRadius: 18, padding: 16 },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  defaultPill: { borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 }
});
