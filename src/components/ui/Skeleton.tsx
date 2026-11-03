import React, { useEffect, useRef } from 'react';
import { Animated, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface SkeletonProps {
  width: DimensionValue;
  height: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Shimmering placeholder block — used instead of a bare spinner while content loads. */
export function Skeleton({ width, height, radius, style }: SkeletonProps) {
  const { colors, radii } = useTheme();
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.45, duration: 650, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return <Animated.View style={[{ width, height, borderRadius: radius ?? radii.sm, backgroundColor: colors.surfaceSunken, opacity: pulse }, style]} />;
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  const { spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: spacing[4] }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ width: '48%', marginBottom: spacing[5] }}>
          <Skeleton width="100%" height={170} radius={16} />
          <Skeleton width="85%" height={14} style={{ marginTop: spacing[3] }} />
          <Skeleton width="45%" height={14} style={{ marginTop: spacing[2] }} />
        </View>
      ))}
    </View>
  );
}
