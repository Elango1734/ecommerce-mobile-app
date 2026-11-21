import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/theme/ThemeProvider';
import { shadow } from '@/theme/shadow';
import { ThemedText } from '@/components/ui/Themed';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { HomeGlyph, GridGlyph, CartGlyph, GearGlyph, SparklesGlyph } from '@/components/ui/icons';
import { useCart } from '@/hooks/useCart';
import HomeScreen from '@/screens/HomeScreen';
import CategoriesScreen from '@/screens/CategoriesScreen';
import CartScreen from '@/screens/CartScreen';
import AccountScreen from '@/screens/AccountScreen';
import type { TabParamList } from './types';
import { textSizes } from '@shopsphere/config';

const Tab = createBottomTabNavigator<TabParamList>();

const GLYPHS: Record<string, React.ComponentType<{ size?: number; color: string; strokeWidth?: number }>> = {
  Home: HomeGlyph,
  Categories: GridGlyph,
  Cart: CartGlyph,
  Account: GearGlyph
};

/**
 * The tab bar is icon-only — these are never rendered as captions, they are
 * only the accessibility labels, so the tabs stay announceable to VoiceOver.
 */
const TAB_LABELS: Record<string, string> = {
  Home: 'Home',
  Categories: 'Categories',
  Cart: 'Cart',
  Account: 'Profile'
};

function TabButton({
  routeName,
  focused,
  onPress,
  badgeCount
}: {
  routeName: string;
  focused: boolean;
  onPress: () => void;
  badgeCount: number;
}) {
  const { colors } = useTheme();
  const Glyph = GLYPHS[routeName] ?? HomeGlyph;
  const label = TAB_LABELS[routeName] ?? routeName;
  const tint = focused ? colors.textPrimary : colors.textMuted;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <View>
        <Glyph size={26} color={tint} strokeWidth={focused ? 2.2 : 1.8} />
        {badgeCount > 0 ? (
          <View
            style={{
              position: 'absolute',
              top: -5,
              right: -9,
              // Sized to hold "9+" at textSizes.description — the scale's
              // smallest role, so the badge grows rather than the type shrinking.
              minWidth: 22,
              height: 18,
              borderRadius: 9,
              backgroundColor: colors.danger,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 3
            }}
          >
            <ThemedText style={{ fontSize: textSizes.description, lineHeight: 18, color: colors.onAccent }} weight="bold">
              {badgeCount > 9 ? '9+' : badgeCount}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function AiLaunchButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  const breathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.08, duration: 1100, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 1100, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathe]);

  return (
    <View
      style={{
        position: 'absolute',
        top: LAUNCHER_CENTER_Y - LAUNCHER_RADIUS,
        left: '50%',
        marginLeft: -LAUNCHER_RADIUS,
        alignItems: 'center'
      }}
    >
      <Animated.View style={{ transform: [{ scale: breathe }] }}>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Ask Sphere AI"
          onPress={onPress}
          scaleTo={0.9}
          style={{
            width: LAUNCHER_RADIUS * 2,
            height: LAUNCHER_RADIUS * 2,
            borderRadius: LAUNCHER_RADIUS,
            backgroundColor: colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadow('lg', colors.accent)
          }}
        >
          <SparklesGlyph size={26} color={colors.onAccent} />
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

/** Thickness of the bar — where the tab icons sit. */
const BAR_HEIGHT = 56;
const LAUNCHER_RADIUS = 28;
/** Launcher centre, relative to the top of the bar; negative half rides above it. */
const LAUNCHER_CENTER_Y = 10;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, spacing, resolvedScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: cart } = useCart();
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  function renderTab(route: (typeof state.routes)[number]) {
    const index = state.routes.findIndex((r) => r.key === route.key);
    const focused = state.index === index;
    return (
      <TabButton
        key={route.key}
        routeName={route.name}
        focused={focused}
        badgeCount={route.name === 'Cart' ? cartCount : 0}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        }}
      />
    );
  }

  const bottomPad = insets.bottom || spacing[2];
  // Plain white rather than the theme's `surface` (#FFFEFB, a warm ivory).
  // Dark mode keeps the theme surface; forcing white there would blow out the screen.
  const barSurface = resolvedScheme === 'dark' ? colors.surface : '#FFFFFF';

  return (
    <View style={{ height: BAR_HEIGHT + bottomPad, backgroundColor: barSurface }} pointerEvents="box-none">
      <View style={{ flexDirection: 'row', height: BAR_HEIGHT }}>
        {state.routes.slice(0, 2).map(renderTab)}
        <View style={{ flex: 1 }} pointerEvents="none" />
        {state.routes.slice(2).map(renderTab)}
      </View>
      <AiLaunchButton onPress={() => navigation.navigate('AiChat' as never)} />
    </View>
  );
}

/**
 * Hoisted out of TabNavigator: an inline arrow here is a new component type on
 * every render, which makes React remount the whole tab bar and lose its state.
 */
const renderTabBar = (props: BottomTabBarProps) => <CustomTabBar {...props} />;

export function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
