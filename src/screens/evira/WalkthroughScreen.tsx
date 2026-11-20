import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View, type ViewToken } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontFamilies, textSizes, textLineHeights } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { EviraButton, Illustration } from '@/components/evira';
import type { IllustrationName } from '@/components/evira/Illustration';

const { width } = Dimensions.get('window');

/**
 * Kit screens 3-5 / 8-10. The kit draws three carousel slides that differ
 * only in illustration and headline, so they are one screen with a paged
 * list rather than three routes.
 */
const SLIDES: Array<{ key: string; title: string; illustration: IllustrationName }> = [
  { key: 'browse', title: 'We provide high\nquality products just\nfor you', illustration: 'onlineShopping' },
  { key: 'cart', title: 'Your satisfaction is\nour number one\npriority', illustration: 'shoppingSpree' },
  { key: 'start', title: "Let's start a journey\nwith Elviree", illustration: 'webShopping' }
];

export default function WalkthroughScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.index != null) setIndex(first.index);
  }).current;

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      navigation.navigate('LetsYouIn');
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.skipRow}>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={() => navigation.navigate('LetsYouIn')}>
          <Text style={[styles.skip, { color: colors.textSecondary }]}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Illustration name={item.illustration} size={240} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View
            key={s.key}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? colors.accent : colors.border,
                width: i === index ? 28 : 8
              }
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <EviraButton label={index === SLIDES.length - 1 ? 'Get Started' : 'Next'} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  skipRow: { alignItems: 'flex-end', paddingHorizontal: 24, height: 48, justifyContent: 'center' },
  skip: { fontFamily: fontFamilies.bold, fontSize: textSizes.normal },
  slide: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 24 },
  title: { fontFamily: fontFamilies.bold, fontSize: textSizes.heading, lineHeight: textLineHeights.heading, textAlign: 'center', marginTop: 48 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 24 },
  dot: { height: 8, borderRadius: 4 },
  footer: { paddingHorizontal: 24, paddingBottom: 12 }
});
