import React from 'react';
import { ActivityIndicator, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { shadow } from '@/theme/shadow';
import { ThemedText } from './Themed';
import { AnimatedPressable } from './AnimatedPressable';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, variant = 'primary', size = 'md', loading, fullWidth, disabled, style, ...props }: ButtonProps) {
  const { colors, spacing, radii } = useTheme();
  const isDisabled = disabled || loading;

  const paddingVertical = size === 'sm' ? spacing[2] : size === 'lg' ? spacing[4] : spacing[3];
  const paddingHorizontal = size === 'sm' ? spacing[3] : size === 'lg' ? spacing[6] : spacing[5];

  const styleByVariant = {
    primary: { backgroundColor: colors.accent, borderWidth: 0, ...shadow('sm', colors.accent) },
    secondary: { backgroundColor: colors.surfaceElevated, borderWidth: 0 },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent', borderWidth: 0 },
    danger: { backgroundColor: colors.danger, borderWidth: 0, ...shadow('sm', colors.danger) }
  } as const;

  const textColor = variant === 'primary' || variant === 'danger' ? colors.onAccent : colors.textPrimary;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      scaleTo={0.97}
      {...props}
      containerStyle={{ width: fullWidth ? '100%' : undefined, opacity: isDisabled ? 0.5 : 1 }}
      style={[
        {
          paddingVertical,
          paddingHorizontal,
          borderRadius: radii.md,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: spacing[2]
        },
        styleByVariant[variant],
        style
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : null}
      <ThemedText variant="label" weight="semibold" style={{ color: textColor }}>
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}
