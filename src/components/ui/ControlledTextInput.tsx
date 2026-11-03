import React from 'react';
import { TextInput, View } from 'react-native';
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from './Themed';

/**
 * A thin wrapper around `useController` (the hook react-hook-form's own
 * `<Controller>` component wraps) rather than rendering `<Controller>`
 * directly — react-hook-form 7.56.3's `<Controller>` JSX typing does not
 * resolve cleanly against React 19's stricter JSX element types in this
 * project's strict tsconfig. `useController` is a plain hook, so it has no
 * such JSX-component typing to fail; this sidesteps the incompatibility
 * instead of papering over it with an `any` cast.
 */
export function ControlledTextInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none'
}: {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
}) {
  const { field, fieldState } = useController({ control, name });
  const { colors, spacing, radii } = useTheme();

  return (
    <View style={{ marginBottom: spacing[4] }}>
      <ThemedText variant="label" style={{ marginBottom: spacing[1] }}>
        {label}
      </ThemedText>
      <TextInput
        value={(field.value as string | undefined) ?? ''}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        accessibilityLabel={label}
        style={{
          borderWidth: 1,
          borderColor: fieldState.error ? colors.danger : colors.border,
          borderRadius: radii.md,
          paddingVertical: spacing[3],
          paddingHorizontal: spacing[4],
          color: colors.textPrimary
        }}
      />
      {fieldState.error ? (
        <ThemedText variant="caption" color="danger" style={{ marginTop: spacing[1] }}>
          {fieldState.error.message}
        </ThemedText>
      ) : null}
    </View>
  );
}
