import React, { useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { useCreateTicket, useSupportTickets } from '@/hooks/useSupport';
import { useIsAuthenticated } from '@/stores/authStore';
import { ApiClientError } from '@shopsphere/api-client';

export default function SupportScreen() {
  const navigation = useNavigation();
  const { colors, spacing, radii } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const { data, isLoading, isError, error, refetch } = useSupportTickets();
  const createTicket = useCreateTicket();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <EmptyState title="Sign in for support" actionLabel="Sign in" onAction={() => navigation.navigate('Login')} />
      </ThemedView>
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
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        data={data?.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing[4], gap: spacing[3] }}
        ListHeaderComponent={
          <Card style={{ marginBottom: spacing[4] }}>
            <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
              New ticket
            </ThemedText>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Subject"
              placeholderTextColor={colors.textMuted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing[3], color: colors.textPrimary, marginBottom: spacing[2] }}
            />
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="How can we help?"
              placeholderTextColor={colors.textMuted}
              multiline
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing[3], color: colors.textPrimary, minHeight: 60, marginBottom: spacing[2] }}
            />
            {formError ? (
              <ThemedText color="danger" variant="bodySmall" style={{ marginBottom: spacing[2] }}>
                {formError}
              </ThemedText>
            ) : null}
            <Button label="Submit" size="sm" loading={createTicket.isPending} onPress={onCreate} />
          </Card>
        }
        ListEmptyComponent={<ThemedText color="muted">No support tickets yet.</ThemedText>}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('SupportTicket', { ticketId: item.id })}>
            <Card>
              <ThemedText weight="semibold">{item.subject}</ThemedText>
              <View style={{ marginTop: spacing[1] }}>
                <StatusBadge status={item.status} />
              </View>
            </Card>
          </Pressable>
        )}
      />
    </ThemedView>
  );
}
