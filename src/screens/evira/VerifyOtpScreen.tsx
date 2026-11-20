import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies, textSizes, textLineHeights } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { EviraButton, EviraHeader, Illustration } from '@/components/evira';
import type { AppParamList } from '@/navigation/types';

const LENGTH = 4;
const RESEND_SECONDS = 55;

/** Kit screens 24-25 — four boxes, each advancing focus as it fills. */
export default function VerifyOtpScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<AppParamList, 'VerifyOtp'>>();
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const complete = useMemo(() => digits.every((d) => d !== ''), [digits]);

  const setDigit = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    if (v && i < LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const onKeyPress = (i: number, key: string) => {
    if (key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <EviraHeader title="Forgot Password" />
      <View style={styles.body}>
        <View style={styles.illustrationWrap}>
          <Illustration name="verified" size={180} />
        </View>
        <Text style={[styles.lead, { color: colors.textPrimary }]}>
          Code has been sent to {params.destination}
        </Text>

        <View style={styles.row}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(r) => {
                inputs.current[i] = r;
              }}
              accessibilityLabel={`Digit ${i + 1}`}
              value={d}
              onChangeText={(t) => setDigit(i, t)}
              onKeyPress={(e) => onKeyPress(i, e.nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={i === 0}
              style={[
                styles.box,
                {
                  backgroundColor: colors.surfaceSunken,
                  borderColor: d ? colors.accent : 'transparent',
                  color: colors.textPrimary
                }
              ]}
            />
          ))}
        </View>

        <Text style={[styles.resend, { color: colors.textSecondary }]}>
          {seconds > 0 ? `Resend code in ${seconds} s` : 'Didn’t receive the code?'}
        </Text>
        {seconds === 0 ? (
          <Text
            accessibilityRole="button"
            onPress={() => setSeconds(RESEND_SECONDS)}
            style={[styles.resendLink, { color: colors.textPrimary }]}
          >
            Resend code
          </Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        <EviraButton
          label="Verify"
          disabled={!complete}
          onPress={() => navigation.navigate('CreateNewPassword')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  illustrationWrap: { alignItems: 'center', marginBottom: 16 },
  lead: { fontFamily: fontFamilies.medium, fontSize: textSizes.title, lineHeight: textLineHeights.title, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 },
  box: {
    width: 70,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    textAlign: 'center',
    fontFamily: fontFamilies.bold,
    fontSize: textSizes.heading
  },
  resend: { fontFamily: fontFamilies.medium, fontSize: textSizes.description, textAlign: 'center', marginTop: 32 },
  resendLink: { fontFamily: fontFamilies.bold, fontSize: textSizes.normal, textAlign: 'center', marginTop: 8 },
  footer: { paddingHorizontal: 24, paddingBottom: 12 }
});
