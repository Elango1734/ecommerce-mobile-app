import React, { useRef } from 'react';
import { Animated, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from './ui/Themed';

/**
 * `storageKey` is an opaque field (database-design.md); this stage's
 * backend has no upload/object-storage/CDN endpoint yet (see apps/api's
 * README known limitations), so there is usually no resolvable URL. When the
 * key happens to already be a full URL (e.g. seeded with one), render it;
 * otherwise show a deliberate, on-brand placeholder rather than a broken
 * image or a silently blank box.
 */
export function ProductImage({ storageKey, altText }: { storageKey?: string; altText?: string }) {
  const { colors } = useTheme();
  const isResolvableUrl = Boolean(storageKey && /^https?:\/\//.test(storageKey));
  const opacity = useRef(new Animated.Value(0)).current;

  if (isResolvableUrl) {
    return (
      <View style={{ width: '100%', height: '100%', backgroundColor: colors.surfaceSunken }}>
        <Animated.Image
          source={{ uri: storageKey }}
          accessibilityLabel={altText}
          onLoad={() => Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }).start()}
          style={{ width: '100%', height: '100%', opacity }}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={altText ?? 'Product image unavailable'}
      style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSunken }}
    >
      <ThemedText variant="title" color="muted">
        {(altText ?? '?').trim().charAt(0).toUpperCase()}
      </ThemedText>
    </View>
  );
}
