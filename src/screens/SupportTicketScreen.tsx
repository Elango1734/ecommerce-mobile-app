import React, { useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Button } from '@/components/ui/Button';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { useAddSupportMessage, useSupportMessages, useSupportTicket } from '@/hooks/useSupport';
import type { AppParamList } from '@/navigation/types';

export default function SupportTicketScreen() {
  const { ticketId } = useRoute<RouteProp<AppParamList, 'SupportTicket'>>().params;
  const { colors, spacing, radii } = useTheme();
  const ticket = useSupportTicket(ticketId);
  const messages = useSupportMessages(ticketId);
  const addMessage = useAddSupportMessage(ticketId ?? '');
  const [body, setBody] = useState('');

  if (ticket.isLoading || messages.isLoading) return <LoadingState label="Loading ticket…" />;
  if (ticket.isError || !ticket.data) return <ErrorState message={(ticket.error as Error)?.message ?? 'Ticket not found'} onRetry={() => ticket.refetch()} />;

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={{ padding: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}>
        <ThemedText variant="heading">{ticket.data.subject}</ThemedText>
      </View>
      <FlatList
        data={messages.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing[4], gap: spacing[3] }}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: colors.surfaceElevated,
              borderRadius: radii.lg,
              padding: spacing[3],
              maxWidth: '85%'
            }}
          >
            <ThemedText>{item.body}</ThemedText>
            <ThemedText variant="caption" color="muted">
              {new Date(item.createdAt).toLocaleString()}
            </ThemedText>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', padding: spacing[3], gap: spacing[2], borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Write a message…"
          placeholderTextColor={colors.textMuted}
          style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingVertical: spacing[2], paddingHorizontal: spacing[3], color: colors.textPrimary }}
        />
        <Button
          label="Send"
          size="sm"
          loading={addMessage.isPending}
          onPress={() => {
            if (!body.trim()) return;
            addMessage.mutate(body.trim(), { onSuccess: () => setBody('') });
          }}
        />
      </View>
    </ThemedView>
  );
}
