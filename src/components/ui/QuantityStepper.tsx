import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from './Themed';
import { AnimatedPressable } from './AnimatedPressable';

interface QuantityStepperProps {
  quantity: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ quantity, onChange, min = 1, max = 999 }: QuantityStepperProps) {
  const { colors, spacing, radii } = useTheme();

  const canDecrease = quantity > min;
  const canIncrease = quantity < max;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.full,
        overflow: 'hidden'
      }}
    >
      <AnimatedPressable
        accessibilityLabel="Decrease quantity"
        disabled={!canDecrease}
        onPress={() => onChange(Math.max(min, quantity - 1))}
        scaleTo={0.85}
        style={{ paddingVertical: spacing[2], paddingHorizontal: spacing[4], alignItems: 'center', justifyContent: 'center' }}
        containerStyle={{ opacity: canDecrease ? 1 : 0.4 }}
      >
        <ThemedText variant="heading">−</ThemedText>
      </AnimatedPressable>
      <ThemedText variant="body" weight="semibold" style={{ minWidth: 32, textAlign: 'center' }}>
        {quantity}
      </ThemedText>
      <AnimatedPressable
        accessibilityLabel="Increase quantity"
        disabled={!canIncrease}
        onPress={() => onChange(Math.min(max, quantity + 1))}
        scaleTo={0.85}
        style={{ paddingVertical: spacing[2], paddingHorizontal: spacing[4], alignItems: 'center', justifyContent: 'center' }}
        containerStyle={{ opacity: canIncrease ? 1 : 0.4 }}
      >
        <ThemedText variant="heading">+</ThemedText>
      </AnimatedPressable>
    </View>
  );
}
