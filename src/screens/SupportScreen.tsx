import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { EviraButton, EviraHeader } from '@/components/evira';
import { ChevronRightGlyph, MessageGlyph } from '@/components/ui/icons';
import { useCreateTicket, useSupportTickets } from '@/hooks/useSupport';
import { useIsAuthenticated } from '@/stores/authStore';
import { ApiClientError } from '@shopsphere/api-client';

/** Kit screens 93-95 (help center / contact CS). */
export default function SupportScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const { data, isLoading, isError, error, refetch } = useSupportTickets();
  const createTicket = useCreateTicket();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
        <EmptyState title="Sign in for support" actionLabel="Sign in" onAction={() => navigation.navigate('Login')} />
      </SafeAreaView>
    );
  }
  if (isLoading) return <LoadingState label="Loading tickets…" />;
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;

  const onCreate = async () => {
    if (!subject.trim() || !message.trim()) return;
    setFormError(null);
    try {
      await createTicket.mutateAsync({ category: 'other', subject: subject.trim(), message: message.trim() });
      setSubject('');
      setMessage('');
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : 'Unable to create ticket.');
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <EviraHeader title="Help Center" />
      <FlatList
        data={data?.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={[styles.newCard, { backgroundColor: colors.surfaceSunken }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textPrimary }]}>New ticket</ThemedText>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Subject"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary }]}
            />
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="How can we help?"
              placeholderTextColor={colors.textMuted}
              multiline
              style={[styles.input, styles.textarea, { backgroundColor: colors.surface, color: colors.textPrimary }]}
            />
            {formError ? <ThemedText style={{ color: colors.danger, marginBottom: 10 }}>{formError}</ThemedText> : null}
            <EviraButton label="Submit" loading={createTicket.isPending} onPress={onCreate} style={styles.submit} />
          </View>
        }
        ListEmptyComponent={<ThemedText style={{ fontFamily: fontFamilies.medium, color: colors.textMuted }}>No support tickets yet.</ThemedText>}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('SupportTicket', { ticketId: item.id })} style={[styles.ticketRow, { backgroundColor: colors.surfaceSunken }]}>
            <View style={[styles.ticketIcon, { backgroundColor: colors.surface }]}>
              <MessageGlyph size={18} color={colors.textPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText numberOfLines={1} style={{ fontFamily: fontFamilies.bold, fontSize: 15, color: colors.textPrimary }}>
                {item.subject}
              </ThemedText>
              <View style={{ marginTop: 6 }}>
                <StatusBadge status={item.status} />
              </View>
            </View>
            <ChevronRightGlyph size={18} color={colors.textMuted} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingBottom: 24, gap: 12 },
  sectionTitle: { fontFamily: fontFamilies.bold, fontSize: 18, marginBottom: 14 },
  newCard: { borderRadius: 20, padding: 20, marginBottom: 12 },
  input: { borderRadius: 14, padding: 14, fontFamily: fontFamilies.medium, fontSize: 14, marginBottom: 12 },
  textarea: { minHeight: 70, textAlignVertical: 'top' },
  submit: { height: 48 },
  ticketRow: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 14 },
  ticketIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }
});
