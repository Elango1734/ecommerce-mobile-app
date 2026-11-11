/**
 * Evira primitives — the building blocks every Evira screen is assembled
 * from. Geometry is taken from the kit's three unlocked screens (the only
 * ones in the preview file that still carry real layers): 380x48 header
 * rows, 28x28 icon buttons, 100px pill CTAs, 16px field radii.
 */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ArrowLeftGlyph } from '@/components/ui/icons';

/** Screen title row: 28x28 back button + 24/700 title, 48pt tall. */
export function EviraHeader({
  title,
  right,
  onBack
}: {
  title?: string;
  right?: React.ReactNode;
  onBack?: () => void;
}) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={12}
        onPress={onBack ?? (() => navigation.goBack())}
        style={styles.iconButton}
      >
        <ArrowLeftGlyph size={24} color={colors.textPrimary} />
      </Pressable>
      {title ? (
        <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      {right ? <View style={styles.headerRight}>{right}</View> : null}
    </View>
  );
}

/** The kit's primary CTA: full-bleed 58pt pill, near-black in light mode. */
export function EviraButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const bg =
    variant === 'primary' ? colors.accent : variant === 'outline' ? 'transparent' : colors.surfaceSunken;
  const fg = variant === 'primary' ? colors.onAccent : colors.textPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: variant === 'primary' && pressed ? colors.accentPressed : bg,
          borderColor: variant === 'outline' ? colors.border : 'transparent',
          borderWidth: variant === 'outline' ? 1 : 0,
          opacity: disabled ? 0.45 : 1
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.buttonLabel, { color: fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

/** Outlined row used for the "Continue with ..." providers. */
export function EviraSocialButton({
  label,
  icon,
  onPress
}: {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.social,
        {
          borderColor: colors.border,
          backgroundColor: pressed ? colors.surfaceSunken : colors.surface
        }
      ]}
    >
      <View style={styles.socialIcon}>{icon}</View>
      <Text style={[styles.socialLabel, { color: colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

/** Filled field with a leading glyph — the kit's standard text input. */
export function EviraField({
  leading,
  trailing,
  style,
  ...props
}: TextInputProps & { leading?: React.ReactNode; trailing?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.field, { backgroundColor: colors.surfaceSunken }]}>
      {leading ? <View style={styles.fieldIcon}>{leading}</View> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.fieldInput, { color: colors.textPrimary }, style]}
        {...props}
      />
      {trailing ? <View style={styles.fieldIcon}>{trailing}</View> : null}
    </View>
  );
}

/** "or continue with" rule. */
export function EviraDivider({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.divider}>
      <View style={[styles.rule, { backgroundColor: colors.borderSubtle }]} />
      <Text style={[styles.dividerLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.rule, { backgroundColor: colors.borderSubtle }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24 },
  iconButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: fontFamilies.bold, fontSize: 24, lineHeight: 29 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  button: {
    height: 58,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  buttonLabel: { fontFamily: fontFamilies.bold, fontSize: 16, lineHeight: 22 },
  social: {
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  socialIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  socialLabel: { fontFamily: fontFamilies.semibold, fontSize: 16, lineHeight: 22 },
  field: { minHeight: 60, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12 },
  fieldIcon: { width: 24, alignItems: 'center', justifyContent: 'center' },
  fieldInput: { flex: 1, fontFamily: fontFamilies.semibold, fontSize: 16, paddingVertical: 18 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  rule: { flex: 1, height: 1 },
  dividerLabel: { fontFamily: fontFamilies.semibold, fontSize: 14 }
});
