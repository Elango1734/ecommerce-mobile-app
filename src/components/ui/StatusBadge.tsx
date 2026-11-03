import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from './Themed';

const POSITIVE = new Set(['paid', 'delivered', 'approved', 'succeeded', 'active', 'published', 'processed', 'resolved']);
const NEGATIVE = new Set(['failed', 'cancelled', 'rejected', 'suspended', 'closed']);
const NEUTRAL_WARN = new Set(['pending', 'processing', 'requested', 'return_requested', 'partially_shipped', 'partially_refunded']);

function toneFor(status: string): 'success' | 'danger' | 'warning' | 'info' {
  const key = status.toLowerCase();
  if (POSITIVE.has(key)) return 'success';
  if (NEGATIVE.has(key)) return 'danger';
  if (NEUTRAL_WARN.has(key)) return 'warning';
  return 'info';
}

export function StatusBadge({ status }: { status: string }) {
  const { colors, spacing, radii } = useTheme();
  const tone = toneFor(status);
  const toneColor = { success: colors.success, danger: colors.danger, warning: colors.warning, info: colors.info }[tone];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
        backgroundColor: `${toneColor}1A`,
        borderRadius: radii.full,
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[3]
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: toneColor }} />
      <ThemedText variant="caption" weight="semibold" style={{ color: toneColor }}>
        {status.replace(/_/g, ' ')}
      </ThemedText>
    </View>
  );
}
