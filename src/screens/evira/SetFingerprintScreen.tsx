import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { EviraButton, EviraHeader, Illustration } from '@/components/evira';
import { EviraSuccessDialog } from './EviraSuccessScreen';

/** Kit screen 21. */
export default function SetFingerprintScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [done, setDone] = useState(false);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <EviraHeader title="Set Your Fingerprint" />
      <View style={styles.body}>
        <Text style={[styles.lead, { color: colors.textSecondary }]}>
          Add a fingerprint to make your account more secure.
        </Text>
        <View style={styles.art}>
          <Illustration name="biometricLogin" size={240} />
        </View>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Please put your finger on the fingerprint scanner to get started.
        </Text>
      </View>

      <View style={styles.footer}>
        <EviraButton label="Skip" variant="ghost" onPress={() => setDone(true)} style={styles.half} />
        <EviraButton label="Continue" onPress={() => setDone(true)} style={styles.half} />
      </View>

      <EviraSuccessDialog
        visible={done}
        title="Congratulations!"
        message="Your account is ready to use. You will be redirected to the Home page in a few seconds."
        cta="Go to Home"
        onPress={() => {
          setDone(false);
          navigation.navigate('Tabs');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, paddingHorizontal: 24, alignItems: 'center' },
  lead: { fontFamily: fontFamilies.medium, fontSize: 18, lineHeight: 25, textAlign: 'center', marginTop: 24 },
  art: { alignItems: 'center', marginTop: 40 },
  hint: { fontFamily: fontFamilies.medium, fontSize: 16, lineHeight: 22, textAlign: 'center', marginTop: 40 },
  footer: { flexDirection: 'row', gap: 16, paddingHorizontal: 24, paddingBottom: 12 },
  half: { flex: 1 }
});
