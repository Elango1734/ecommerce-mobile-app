import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { EviraButton } from '@/components/evira';

/**
 * The kit's recurring confirmation sheet (screens 22, 27, 65, 75). It is
 * drawn as a centred card over a dimmed backdrop, so it is one reusable
 * component rather than four near-identical screens.
 */
export function EviraSuccessDialog({
  visible,
  title,
  message,
  cta,
  onPress
}: {
  visible: boolean;
  title: string;
  message: string;
  cta: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onPress}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.art, { backgroundColor: colors.surfaceSunken }]} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          <EviraButton label={cta} onPress={onPress} style={styles.cta} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', borderRadius: 40, alignItems: 'center', padding: 32 },
  art: { width: 180, height: 180, borderRadius: 90 },
  title: { fontFamily: fontFamilies.bold, fontSize: 24, lineHeight: 29, textAlign: 'center', marginTop: 24 },
  message: { fontFamily: fontFamilies.medium, fontSize: 16, lineHeight: 22, textAlign: 'center', marginTop: 12 },
  cta: { alignSelf: 'stretch', marginTop: 28 }
});
