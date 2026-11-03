import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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

export default function AiChatScreen() {
  const navigation = useNavigation();
  const { seedMessage, mode, orderId } = useRoute<RouteProp<AppParamList, 'AiChat'>>().params ?? {};
  const isSupportMode = mode === 'support';
  const { colors, spacing, radii } = useTheme();
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
    <ThemedView style={{ flex: 1 }}>
      {turns.length === 0 ? (
        <View style={{ padding: spacing[5] }}>
          <ThemedText variant="heading" style={{ marginBottom: spacing[1] }}>
            Sphere AI
          </ThemedText>
          <ThemedText color="muted" style={{ marginBottom: spacing[4] }}>
            {isSupportMode
              ? `I can check the real status of order ${orderId?.slice(-8)}, or answer policy questions — I never invent an order status or policy detail.`
              : "Development mode: I search ShopSphere's real catalog based on what you type — I never invent a price, product, or stock status."}
          </ThemedText>
          {!isSupportMode &&
            STARTER_PROMPTS.map((prompt) => (
              <Pressable key={prompt} onPress={() => send(prompt)} style={{ marginBottom: spacing[2] }}>
                <Card>
                  <ThemedText>{prompt}</ThemedText>
                </Card>
              </Pressable>
            ))}
        </View>
      ) : (
        <FlatList
          data={turns}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ padding: spacing[4], gap: spacing[3] }}
          renderItem={({ item }) => (
            <View
              style={{
                alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: item.role === 'user' ? colors.accent : colors.surfaceElevated,
                borderRadius: radii.lg,
                padding: spacing[3],
                maxWidth: '85%'
              }}
            >
              <ThemedText style={{ color: item.role === 'user' ? colors.onAccent : colors.textPrimary }}>{item.content}</ThemedText>
              {item.products?.map((product) => (
                <Pressable key={product.id} onPress={() => navigation.navigate('ProductDetail', { slug: product.slug })} style={{ marginTop: spacing[2] }}>
                  <View style={{ backgroundColor: colors.surfaceSunken, borderRadius: radii.md, padding: spacing[2] }}>
                    <ThemedText variant="bodySmall" weight="medium">
                      {product.name}
                    </ThemedText>
                    <ThemedText variant="caption" color="muted">
                      {product.priceRange ? formatMoney({ amountMinor: product.priceRange.minAmountMinor, currency: product.priceRange.currency }) : 'Price unavailable'}
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        />
      )}

      <View style={{ flexDirection: 'row', padding: spacing[3], gap: spacing[2], borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Describe what you're looking for…"
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={() => send(input)}
          style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingVertical: spacing[2], paddingHorizontal: spacing[3], color: colors.textPrimary }}
        />
        <Button label="Send" size="sm" loading={isPending} onPress={() => send(input)} />
      </View>

      {conversationId ? (
        <Button
          label="Delete conversation history"
          variant="ghost"
          size="sm"
          onPress={() => {
            deleteHistory.mutate(conversationId);
            setTurns([]);
            setConversationId(undefined);
          }}
          style={{ margin: spacing[3] }}
        />
      ) : null}
    </ThemedView>
  );
}
