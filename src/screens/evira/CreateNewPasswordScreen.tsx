import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies, textSizes, textLineHeights } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { EviraButton, EviraField, EviraHeader, Illustration } from '@/components/evira';
import { EviraSuccessDialog } from './EviraSuccessScreen';
import { CheckGlyph, EyeGlyph, EyeOffGlyph, LockGlyph } from '@/components/ui/icons';

/** Kit screen 26 — the one screen whose real layers survived in the preview. */
export default function CreateNewPasswordScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [hide, setHide] = useState(true);
  const [remember, setRemember] = useState(false);
  const [done, setDone] = useState(false);

  const valid = password.length >= 8 && password === confirm;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <EviraHeader title="Create New Password" />
      <View style={styles.body}>
        <Illustration name="securePassword" size={220} />
        <Text style={[styles.lead, { color: colors.textPrimary }]}>Create Your New Password</Text>

        <View style={styles.fields}>
          <EviraField
            placeholder="New Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={hide}
            autoCapitalize="none"
            leading={<LockGlyph size={20} color={colors.textMuted} />}
            trailing={
              <Pressable accessibilityRole="button" hitSlop={10} onPress={() => setHide((h) => !h)}>
                {hide ? (
                  <EyeOffGlyph size={20} color={colors.textMuted} />
                ) : (
                  <EyeGlyph size={20} color={colors.textMuted} />
                )}
              </Pressable>
            }
          />
          <EviraField
            placeholder="Confirm New Password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={hide}
            autoCapitalize="none"
            leading={<LockGlyph size={20} color={colors.textMuted} />}
          />
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: remember }}
          onPress={() => setRemember((r) => !r)}
          style={styles.remember}
        >
          <View
            style={[
              styles.checkbox,
              { borderColor: colors.accent, backgroundColor: remember ? colors.accent : 'transparent' }
            ]}
          >
            {remember ? <CheckGlyph size={14} color={colors.onAccent} /> : null}
          </View>
          <Text style={[styles.rememberLabel, { color: colors.textPrimary }]}>Remember me</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <EviraButton label="Continue" disabled={!valid} onPress={() => setDone(true)} />
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
  body: { flex: 1, paddingHorizontal: 24 },
  lead: { fontFamily: fontFamilies.bold, fontSize: textSizes.title, lineHeight: textLineHeights.title, marginTop: 24 },
  fields: { gap: 20, marginTop: 20 },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24 },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rememberLabel: { fontFamily: fontFamilies.semibold, fontSize: textSizes.description },
  footer: { paddingHorizontal: 24, paddingBottom: 12 }
});
