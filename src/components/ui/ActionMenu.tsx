import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { fontFamilies, textSizes, textLineHeights } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from './Themed';

export type ActionMenuItem = {
  label: string;
  onPress: () => void;
  /** Renders in the danger colour — for destructive entries like "Clear all". */
  destructive?: boolean;
  disabled?: boolean;
};

/**
 * The kit's header "⋯" menu (screens 30 and 32), as a bottom sheet rather than a
 * floating popover: a popover anchored to a 28pt icon is a small touch target to
 * aim at one-handed, and the rest of the app already uses this sheet geometry
 * (32pt top radii, full-width rows).
 */
export function ActionMenu({
  visible,
  onClose,
  title,
  items
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  items: ActionMenuItem[];
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close menu">
        <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.grabber, { backgroundColor: colors.border }]} />
          {title ? <ThemedText style={[styles.title, { color: colors.textPrimary }]}>{title}</ThemedText> : null}
          {items.map((item, index) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityState={{ disabled: !!item.disabled }}
              disabled={item.disabled}
              onPress={() => {
                onClose();
                item.onPress();
              }}
              style={[styles.row, index > 0 ? { borderTopWidth: 1, borderTopColor: colors.borderSubtle } : null]}
            >
              <ThemedText
                style={{
                  fontFamily: fontFamilies.semibold,
                  fontSize: textSizes.normal,
                  lineHeight: textLineHeights.normal,
                  opacity: item.disabled ? 0.4 : 1,
                  color: item.destructive ? colors.danger : colors.textPrimary
                }}
              >
                {item.label}
              </ThemedText>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
  grabber: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, marginBottom: 12 },
  title: { fontFamily: fontFamilies.bold, fontSize: textSizes.title, lineHeight: textLineHeights.title, paddingVertical: 8 },
  row: { paddingVertical: 18 }
});
