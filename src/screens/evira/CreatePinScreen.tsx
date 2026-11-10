import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { EviraButton, EviraHeader } from '@/components/evira';
import type { AppParamList } from '@/navigation/types';

const PIN_LENGTH = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '⌫'];

/** Kit screens 20 / 64 / 74 — same keypad, different follow-on route. */
export default function CreatePinScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<AppParamList, 'CreatePin'>>();
  const [pin, setPin] = useState('');

  const press = (k: string) => {
    if (k === '⌫') return setPin((p) => p.slice(0, -1));
    if (k === '*') return;
    setPin((p) => (p.length < PIN_LENGTH ? p + k : p));
  };

  useEffect(() => {
    if (pin.length !== PIN_LENGTH) return;
    // The kit auto-advances once the fourth digit lands.
    const t = setTimeout(() => {
      if (params.intent === 'setup') navigation.navigate('SetFingerprint');
      else navigation.navigate('Tabs');
    }, 180);
    return () => clearTimeout(t);
  }, [pin, params.intent, navigation]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <EviraHeader title="Create New PIN" />
      <View style={styles.body}>
        <Text style={[styles.lead, { color: colors.textSecondary }]}>
          Add a PIN number to make your account more secure.
        </Text>

        <View style={styles.dots}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i < pin.length ? colors.accent : 'transparent',
                  borderColor: i < pin.length ? colors.accent : colors.border
                }
              ]}
            />
          ))}
        </View>

        <View style={styles.pad}>
          {KEYS.map((k) => (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityLabel={k === '⌫' ? 'Delete' : k}
              disabled={k === '*'}
              onPress={() => press(k)}
              style={({ pressed }) => [
                styles.key,
                { backgroundColor: pressed && k !== '*' ? colors.surfaceSunken : 'transparent' }
              ]}
            >
              <Text style={[styles.keyLabel, { color: k === '*' ? 'transparent' : colors.textPrimary }]}>{k}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <EviraButton
          label="Continue"
          disabled={pin.length !== PIN_LENGTH}
          onPress={() => navigation.navigate('SetFingerprint')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, paddingHorizontal: 24, alignItems: 'center' },
  lead: { fontFamily: fontFamilies.medium, fontSize: 18, lineHeight: 25, textAlign: 'center', marginTop: 24 },
  dots: { flexDirection: 'row', gap: 24, marginTop: 48 },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 48, width: '100%' },
  key: { width: '33.33%', height: 72, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  keyLabel: { fontFamily: fontFamilies.semibold, fontSize: 32 },
  footer: { paddingHorizontal: 24, paddingBottom: 12 }
});
