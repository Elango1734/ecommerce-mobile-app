import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { EviraHeader } from '@/components/evira';
import { SendGlyph } from '@/components/ui/icons';
import { useAddSupportMessage, useSupportMessages, useSupportTicket } from '@/hooks/useSupport';
import { useAuthStore } from '@/stores/authStore';
import type { AppParamList } from '@/navigation/types';

/** Kit screens 94-95 (help center contact CS). */
export default function SupportTicketScreen() {
  const { ticketId } = useRoute<RouteProp<AppParamList, 'SupportTicket'>>().params;
  const { colors } = useTheme();
  const userId = useAuthStore((s) => s.user?.id);
  const ticket = useSupportTicket(ticketId);
  const messages = useSupportMessages(ticketId);
  const addMessage = useAddSupportMessage(ticketId ?? '');
  const [body, setBody] = useState('');

  if (ticket.isLoading || messages.isLoading) return <LoadingState label="Loading ticket…" />;
  if (ticket.isError || !ticket.data) return <ErrorState message={(ticket.error as Error)?.message ?? 'Ticket not found'} onRetry={() => ticket.refetch()} />;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <EviraHeader title={ticket.data.subject} />
      <FlatList
        data={messages.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const mine = item.authorId === userId;
          return (
            <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs, { backgroundColor: mine ? colors.accent : colors.surfaceSunken }]}>
              <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: 15, color: mine ? colors.onAccent : colors.textPrimary }}>{item.body}</ThemedText>
              <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: 11, color: mine ? colors.onAccent : colors.textMuted, marginTop: 4, opacity: 0.8 }}>
                {new Date(item.createdAt).toLocaleString()}
              </ThemedText>
            </View>
          );
        }}
      />
      <View style={[styles.composer, { borderTopColor: colors.borderSubtle }]}>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Write a message…"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { backgroundColor: colors.surfaceSunken, color: colors.textPrimary }]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          disabled={addMessage.isPending}
          onPress={() => {
            if (!body.trim()) return;
            addMessage.mutate(body.trim(), { onSuccess: () => setBody('') });
          }}
          style={[styles.sendButton, { backgroundColor: colors.accent, opacity: addMessage.isPending ? 0.6 : 1 }]}
        >
          <SendGlyph size={18} color={colors.onAccent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingVertical: 16, gap: 12 },
  bubble: { maxWidth: '82%', borderRadius: 18, padding: 14 },
  bubbleMine: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleTheirs: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 12, borderTopWidth: 1 },
  input: { flex: 1, height: 48, borderRadius: 100, paddingHorizontal: 20, fontFamily: fontFamilies.semibold, fontSize: 15 },
  sendButton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }
});
