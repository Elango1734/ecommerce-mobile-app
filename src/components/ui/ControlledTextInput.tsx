import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from './Themed';
import { EyeGlyph, EyeOffGlyph } from './icons';

/**
 * A thin wrapper around `useController` (the hook react-hook-form's own
 * `<Controller>` component wraps) rather than rendering `<Controller>`
 * directly — react-hook-form 7.56.3's `<Controller>` JSX typing does not
 * resolve cleanly against React 19's stricter JSX element types in this
 * project's strict tsconfig. `useController` is a plain hook, so it has no
 * such JSX-component typing to fail; this sidesteps the incompatibility
 * instead of papering over it with an `any` cast.
 *
 * Renders as the kit's filled field (placeholder inside the box, no
 * floating label row) rather than an outlined box with a label above it.
 */
export function ControlledTextInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  leading
}: {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  leading?: React.ReactNode;
}) {
  const { field, fieldState } = useController({ control, name });
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{
          minHeight: 60,
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 20,
          backgroundColor: colors.surfaceSunken,
          borderWidth: fieldState.error ? 1.5 : 0,
          borderColor: colors.danger
        }}
      >
        {leading}
        <TextInput
          value={(field.value as string | undefined) ?? ''}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          placeholder={label}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          accessibilityLabel={label}
          style={{ flex: 1, fontFamily: fontFamilies.semibold, fontSize: 16, paddingVertical: 18, color: colors.textPrimary }}
        />
        {secureTextEntry ? (
          <Pressable accessibilityRole="button" accessibilityLabel={hidden ? 'Show password' : 'Hide password'} hitSlop={10} onPress={() => setHidden((h) => !h)}>
            {hidden ? <EyeOffGlyph size={20} color={colors.textMuted} /> : <EyeGlyph size={20} color={colors.textMuted} />}
          </Pressable>
        ) : null}
      </View>
      {fieldState.error ? (
        <ThemedText variant="caption" color="danger" style={{ marginTop: 4, marginLeft: 4 }}>
          {fieldState.error.message}
        </ThemedText>
      ) : null}
    </View>
  );
}
