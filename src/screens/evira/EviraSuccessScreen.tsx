import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { fontFamilies, textSizes, textLineHeights } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { EviraButton, Illustration } from '@/components/evira';

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
          <Illustration name="successful" size={180} />
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
  title: { fontFamily: fontFamilies.bold, fontSize: textSizes.heading, lineHeight: textLineHeights.heading, textAlign: 'center', marginTop: 24 },
  message: { fontFamily: fontFamilies.medium, fontSize: textSizes.normal, lineHeight: textLineHeights.normal, textAlign: 'center', marginTop: 12 },
  cta: { alignSelf: 'stretch', marginTop: 28 }
});
