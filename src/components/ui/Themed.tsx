import React from 'react';
import { Text as RNText, View as RNView, type TextProps, type ViewProps } from 'react-native';
import { fontFamilies, textSizes, textLineHeights } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';

export type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'bodySmall' | 'caption' | 'label';

interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'accent' | 'danger' | 'success';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

/**
 * The seven legacy variants collapsed onto the four-role scale in
 * `@shopsphere/config` — `display`/`heading` both land on `heading`, and
 * `caption` joins `bodySmall`/`label` on `description`, because the scale
 * deliberately has four sizes and not seven.
 */
const VARIANT_SIZES: Record<TextVariant, number> = {
  display: textSizes.heading,
  title: textSizes.title,
  heading: textSizes.heading,
  body: textSizes.normal,
  bodySmall: textSizes.description,
  caption: textSizes.description,
  label: textSizes.description
};

const VARIANT_LINE_HEIGHTS: Record<TextVariant, number> = {
  display: textLineHeights.heading,
  title: textLineHeights.title,
  heading: textLineHeights.heading,
  body: textLineHeights.normal,
  bodySmall: textLineHeights.description,
  caption: textLineHeights.description,
  label: textLineHeights.description
};

export function ThemedText({ variant = 'body', color = 'primary', weight, style, ...props }: ThemedTextProps) {
  const { colors } = useTheme();
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
          // Urbanist ships each weight as its own family, so the face is
          // selected by PostScript name; setting fontWeight as well would
          // make iOS synthesise a second, heavier weight on top.
          fontFamily: fontFamilies[weight ?? defaultWeight],
          lineHeight: VARIANT_LINE_HEIGHTS[variant]
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
