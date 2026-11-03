import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from './Themed';
import { Button } from './Button';
import { FadeSlideIn } from './FadeSlideIn';
import { ProductGridSkeleton } from './Skeleton';

export function LoadingState({ label = 'Loading…', variant = 'spinner' }: { label?: string; variant?: 'spinner' | 'grid' }) {
  const { colors, spacing } = useTheme();

  if (variant === 'grid') {
    return (
      <View style={{ flex: 1, paddingTop: spacing[6] }}>
        <ProductGridSkeleton />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3], padding: spacing[6] }}>
      <ActivityIndicator color={colors.accent} size="large" />
      <ThemedText color="muted">{label}</ThemedText>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { spacing } = useTheme();
  return (
    <FadeSlideIn style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3], padding: spacing[6] }}>
      <ThemedText variant="heading">Something went wrong</ThemedText>
      <ThemedText color="muted" style={{ textAlign: 'center' }}>
        {message}
      </ThemedText>
      {onRetry ? <Button label="Try again" variant="outline" onPress={onRetry} /> : null}
    </FadeSlideIn>
  );
}

export function EmptyState({ title, message, actionLabel, onAction }: { title: string; message?: string; actionLabel?: string; onAction?: () => void }) {
  const { spacing } = useTheme();
  return (
    <FadeSlideIn style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3], padding: spacing[6] }}>
        <ThemedText variant="heading">{title}</ThemedText>
        {message ? (
          <ThemedText color="muted" style={{ textAlign: 'center' }}>
            {message}
          </ThemedText>
        ) : null}
        {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
      </ThemedView>
    </FadeSlideIn>
  );
}
