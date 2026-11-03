import React, { useRef } from 'react';
import { Animated, Pressable, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Shared press micro-interaction: a soft spring scale-down on touch, used by
 * every tappable surface (buttons, product cards, chips) so the app has one
 * consistent "feel" instead of each screen hand-rolling its own opacity hack.
 */
export function AnimatedPressable({
  scaleTo = 0.96,
  style,
  containerStyle,
  children,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) => {
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 50, bounciness: 6 }).start();
  };

  const handlePressIn = (e: GestureResponderEvent) => {
    if (!disabled) animateTo(scaleTo);
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    animateTo(1);
    onPressOut?.(e);
  };

  return (
    <Pressable {...props} disabled={disabled} onPressIn={handlePressIn} onPressOut={handlePressOut} style={containerStyle}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </Pressable>
  );
}
