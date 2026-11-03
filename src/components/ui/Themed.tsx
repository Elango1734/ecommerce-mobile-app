import React from 'react';
import { Text as RNText, View as RNView, type TextProps, type ViewProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'bodySmall' | 'caption' | 'label';

interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'accent' | 'danger' | 'success';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

const VARIANT_SIZES: Record<TextVariant, number> = {
  display: 34,
  title: 28,
  heading: 20,
  body: 16,
  bodySmall: 14,
  caption: 12,
  label: 14
};

export function ThemedText({ variant = 'body', color = 'primary', weight, style, ...props }: ThemedTextProps) {
  const { colors, typography } = useTheme();
  const colorMap = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    muted: colors.textMuted,
    inverse: colors.textInverse,
    accent: colors.accent,
    danger: colors.danger,
    success: colors.success
  } as const;

  const defaultWeight = variant === 'display' || variant === 'title' ? 'bold' : variant === 'heading' || variant === 'label' ? 'semibold' : 'regular';

  return (
    <RNText
      {...props}
      style={[
        {
          color: colorMap[color],
          fontSize: VARIANT_SIZES[variant],
          fontWeight: typography.fontWeight[weight ?? defaultWeight],
          lineHeight: VARIANT_SIZES[variant] * typography.lineHeight.normal
        },
        style
      ]}
    />
  );
}

interface ThemedViewProps extends ViewProps {
  surface?: 'background' | 'surface' | 'elevated' | 'sunken';
}

export function ThemedView({ surface = 'background', style, ...props }: ThemedViewProps) {
  const { colors } = useTheme();
  const surfaceMap = {
    background: colors.background,
    surface: colors.surface,
    elevated: colors.surfaceElevated,
    sunken: colors.surfaceSunken
  } as const;
  return <RNView {...props} style={[{ backgroundColor: surfaceMap[surface] }, style]} />;
}
