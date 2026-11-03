import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { shadow } from '@/theme/shadow';

interface CardProps extends ViewProps {
  elevated?: 'sm' | 'md' | 'lg';
}

export function Card({ style, elevated, ...props }: CardProps) {
  const { colors, radii, spacing } = useTheme();
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: colors.surfaceElevated,
          borderRadius: radii.lg,
          padding: spacing[4],
          borderWidth: elevated ? 0 : 1,
          borderColor: colors.borderSubtle
        },
        elevated ? shadow(elevated, colors.textPrimary) : null,
        style
      ]}
    />
  );
}
