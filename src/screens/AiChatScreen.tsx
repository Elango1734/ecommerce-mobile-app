import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ui/Themed';
import { EviraHeader } from '@/components/evira';
import { SendGlyph, SparklesGlyph } from '@/components/ui/icons';
import { useAiDiscovery, useAiSupport, useDeleteAiHistory } from '@/hooks/useAi';
import { formatMoney } from '@/utils/money';
import type { ProductSummaryDto } from '@shopsphere/api-client';
import { ApiClientError } from '@shopsphere/api-client';
import type { AppParamList } from '@/navigation/types';

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
  products?: ProductSummaryDto[];
}

const STARTER_PROMPTS = ['Headphones under $100', 'Something for my kitchen', 'Beauty products on sale'];

/** Not a kit screen -- Sphere AI is a real ShopSphere feature with no Evira equivalent. Restyled for visual consistency. */
export default function AiChatScreen() {
  const navigation = useNavigation();
  const { seedMessage, mode, orderId } = useRoute<RouteProp<AppParamList, 'AiChat'>>().params ?? {};
  const isSupportMode = mode === 'support';
  const { colors } = useTheme();
  const discovery = useAiDiscovery();
  const support = useAiSupport();
  const deleteHistory = useDeleteAiHistory();

  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [seeded, setSeeded] = useState(false);

  const send = (message: string) => {
    if (!message.trim()) return;
    setTurns((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');

    const onSettled = {
      onSuccess: (result: { conversationId: string; reply: string; products?: ProductSummaryDto[] }) => {
        setConversationId(result.conversationId);
        setTurns((prev) => [...prev, { role: 'assistant', content: result.reply, products: result.products }]);
      },
      onError: (error: unknown) => {
        const message2 = error instanceof ApiClientError ? error.message : "Sphere AI isn't available right now.";
        setTurns((prev) => [...prev, { role: 'assistant', content: message2 }]);
      }
    };

    if (isSupportMode) {
      support.mutate({ message, orderId, conversationId }, onSettled);
    } else {
      discovery.mutate({ message, conversationId }, onSettled);
    }
  };

  const isPending = isSupportMode ? support.isPending : discovery.isPending;

  useEffect(() => {
    if (seedMessage && !seeded) {
      setSeeded(true);
      send(seedMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedMessage, seeded]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <EviraHeader title="Sphere AI" />
      {turns.length === 0 ? (
        <View style={styles.intro}>
          <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: 14, lineHeight: 20, color: colors.textSecondary, marginBottom: 20 }}>
            {isSupportMode
              ? `I can check the real status of order ${orderId?.slice(-8)}, or answer policy questions — I never invent an order status or policy detail.`
              : "I search ShopSphere's real catalog based on what you type — I never invent a price, product, or stock status."}
          </ThemedText>
          {!isSupportMode &&
            STARTER_PROMPTS.map((prompt) => (
              <Pressable key={prompt} onPress={() => send(prompt)} style={[styles.promptCard, { backgroundColor: colors.surfaceSunken }]}>
                <SparklesGlyph size={18} color={colors.textPrimary} />
                <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: 15, color: colors.textPrimary }}>{prompt}</ThemedText>
              </Pressable>
            ))}
        </View>
      ) : (
        <FlatList
          data={turns}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.bubbleMine : styles.bubbleTheirs, { backgroundColor: item.role === 'user' ? colors.accent : colors.surfaceSunken }]}>
              <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: 15, color: item.role === 'user' ? colors.onAccent : colors.textPrimary }}>
                {item.content}
              </ThemedText>
              {item.products?.map((product) => (
                <Pressable key={product.id} onPress={() => navigation.navigate('ProductDetail', { slug: product.slug })} style={[styles.productChip, { backgroundColor: colors.surface }]}>
                  <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: 14, color: colors.textPrimary }}>{product.name}</ThemedText>
                  <ThemedText style={{ fontFamily: fontFamilies.medium, fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    {product.priceRange ? formatMoney({ amountMinor: product.priceRange.minAmountMinor, currency: product.priceRange.currency }) : 'Price unavailable'}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          )}
        />
      )}

      <View style={[styles.composer, { borderTopColor: colors.borderSubtle }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Describe what you're looking for…"
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={() => send(input)}
          style={[styles.input, { backgroundColor: colors.surfaceSunken, color: colors.textPrimary }]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          disabled={isPending}
          onPress={() => send(input)}
          style={[styles.sendButton, { backgroundColor: colors.accent, opacity: isPending ? 0.6 : 1 }]}
        >
          <SendGlyph size={18} color={colors.onAccent} />
        </Pressable>
      </View>

      {conversationId ? (
        <Pressable
          onPress={() => {
            deleteHistory.mutate(conversationId);
            setTurns([]);
            setConversationId(undefined);
          }}
          style={styles.deleteHistory}
        >
          <ThemedText style={{ fontFamily: fontFamilies.semibold, fontSize: 13, color: colors.textMuted }}>Delete conversation history</ThemedText>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  intro: { paddingHorizontal: 24, paddingTop: 12 },
  promptCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16, marginBottom: 12 },
  listContent: { paddingHorizontal: 24, paddingVertical: 16, gap: 12 },
  bubble: { maxWidth: '82%', borderRadius: 18, padding: 14 },
  bubbleMine: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleTheirs: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  productChip: { borderRadius: 12, padding: 10, marginTop: 8 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 12, borderTopWidth: 1 },
  input: { flex: 1, height: 48, borderRadius: 100, paddingHorizontal: 20, fontFamily: fontFamilies.semibold, fontSize: 15 },
  sendButton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  deleteHistory: { alignItems: 'center', paddingVertical: 10 }
});
