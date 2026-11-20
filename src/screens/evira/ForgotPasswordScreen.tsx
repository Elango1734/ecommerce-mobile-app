import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies, textSizes, textLineHeights } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { EviraButton, EviraHeader, Illustration } from '@/components/evira';
import { MailGlyph, PhoneGlyph } from '@/components/ui/icons';

/** Kit screen 23 — choose where the reset code is sent. */
export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [method, setMethod] = useState<'sms' | 'email'>('sms');

  const options = [
    { key: 'sms' as const, icon: PhoneGlyph, label: 'via SMS:', value: '+1 111 ****99' },
    { key: 'email' as const, icon: MailGlyph, label: 'via Email:', value: 'and***ley@yourdomain.com' }
  ];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <EviraHeader title="Forgot Password" />
      <View style={styles.body}>
        <Illustration name="forgotPassword" size={220} />
        <Text style={[styles.lead, { color: colors.textPrimary }]}>
          Select which contact details should we use to reset your password
        </Text>

        <View style={styles.options}>
          {options.map((o) => {
            const active = method === o.key;
            const Icon = o.icon;
            return (
              <Pressable
                key={o.key}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => setMethod(o.key)}
                style={[
                  styles.option,
                  {
                    borderColor: active ? colors.accent : colors.borderSubtle,
                    backgroundColor: colors.surface
                  }
                ]}
              >
                <View style={[styles.optionIcon, { backgroundColor: colors.surfaceSunken }]}>
                  <Icon size={26} color={colors.textPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, { color: colors.textSecondary }]}>{o.label}</Text>
                  <Text style={[styles.optionValue, { color: colors.textPrimary }]}>{o.value}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <EviraButton
          label="Continue"
          onPress={() =>
            navigation.navigate('VerifyOtp', {
              method,
              destination: options.find((o) => o.key === method)!.value
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, paddingHorizontal: 24 },
  lead: { fontFamily: fontFamilies.medium, fontSize: textSizes.title, lineHeight: textLineHeights.title, textAlign: 'center', marginTop: 24 },
  options: { gap: 20, marginTop: 32 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 20, borderWidth: 2, borderRadius: 16, padding: 16 },
  optionIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  optionLabel: { fontFamily: fontFamilies.medium, fontSize: textSizes.description, lineHeight: textLineHeights.description },
  optionValue: { fontFamily: fontFamilies.bold, fontSize: textSizes.title, lineHeight: textLineHeights.title },
  footer: { paddingHorizontal: 24, paddingBottom: 12 }
});
