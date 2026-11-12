import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { fontFamilies } from '@shopsphere/config';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from './Themed';
import { formatMoney } from '@/utils/money';

const THUMB = 26;
const TRACK_HEIGHT = 4;
const HISTOGRAM_HEIGHT = 44;
const HISTOGRAM_BUCKETS = 36;

export type PriceRange = [number, number];

/**
 * Which thumb a touch at `amount` should grab. Outside the current range the
 * answer is the near end; inside it is the closer thumb — and the `<=`/`>=`
 * order matters: with both thumbs stacked on the same value, a touch to the
 * left takes the low one and a touch to the right takes the high one, so a
 * collapsed range can always be pulled back open.
 */
export function thumbForTouch(amount: number, [low, high]: PriceRange): 0 | 1 {
  if (amount <= low) return 0;
  if (amount >= high) return 1;
  return Math.abs(amount - low) <= Math.abs(amount - high) ? 0 : 1;
}

/** Moves one thumb to `amount`, keeping the pair ordered and inside the bounds. */
export function moveThumb(which: 0 | 1, amount: number, value: PriceRange, min: number, max: number): PriceRange {
  const clamped = Math.round(Math.min(Math.max(amount, min), max));
  return which === 0 ? [Math.min(clamped, value[1]), value[1]] : [value[0], Math.max(clamped, value[0])];
}

/**
 * Kit screen 37's price control: a histogram of where the catalog's prices
 * actually sit, with a two-thumb range over it. Tap anywhere on the track to
 * send the nearer thumb there, or drag.
 *
 * One responder owns the whole track (the thumbs are `pointerEvents="none"`
 * decoration) so a touch is never swallowed by a 26pt circle, and it reads its
 * geometry from a ref that every render refreshes — a responder built once from
 * first-render values would still think the track was 0pt wide, which turned
 * every drag into an instant jump to one end.
 */
export function PriceRangeSlider({
  min,
  max,
  currency,
  value,
  prices,
  onChange
}: {
  min: number;
  max: number;
  currency: string;
  value: PriceRange;
  /** Every price in scope, used to draw the distribution behind the track. */
  prices: number[];
  onChange: (next: PriceRange) => void;
}) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  const usable = Math.max(1, width - THUMB);
  const span = Math.max(1, max - min);

  const live = useRef({ min, max, span, usable, value, onChange });
  live.current = { min, max, span, usable, value, onChange };
  const active = useRef<0 | 1>(0);
  const grantAmount = useRef(0);

  const histogram = useMemo(() => {
    const buckets = new Array(HISTOGRAM_BUCKETS).fill(0);
    for (const price of prices) {
      const index = Math.min(HISTOGRAM_BUCKETS - 1, Math.max(0, Math.floor(((price - min) / span) * HISTOGRAM_BUCKETS)));
      buckets[index] += 1;
    }
    const peak = Math.max(1, ...buckets);
    return buckets.map((count) => count / peak);
  }, [prices, min, span]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const current = live.current;
          const x = event.nativeEvent.locationX - THUMB / 2;
          const amount = current.min + (x / current.usable) * current.span;
          const which = thumbForTouch(amount, current.value);
          active.current = which;
          grantAmount.current = amount;
          current.onChange(moveThumb(which, amount, current.value, current.min, current.max));
        },
        onPanResponderMove: (_event, gesture) => {
          const current = live.current;
          const amount = grantAmount.current + (gesture.dx / current.usable) * current.span;
          current.onChange(moveThumb(active.current, amount, current.value, current.min, current.max));
        }
      }),
    []
  );

  const toX = (amount: number) => ((amount - min) / span) * usable;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={styles.histogram} pointerEvents="none">
        {histogram.map((height, index) => {
          const bucketAmount = min + ((index + 0.5) / HISTOGRAM_BUCKETS) * span;
          const inRange = bucketAmount >= value[0] && bucketAmount <= value[1];
          return (
            <View
              key={index}
              style={{
                flex: 1,
                marginHorizontal: 1,
                height: Math.max(2, height * HISTOGRAM_HEIGHT),
                borderRadius: 1,
                backgroundColor: inRange ? colors.textPrimary : colors.border
              }}
            />
          );
        })}
      </View>

      <View
        accessibilityRole="adjustable"
        accessibilityLabel="Price range"
        accessibilityValue={{
          text: `${formatMoney({ amountMinor: value[0], currency })} to ${formatMoney({ amountMinor: value[1], currency })}`
        }}
        style={styles.trackRow}
        {...responder.panHandlers}
      >
        <View style={[styles.track, { backgroundColor: colors.border }]} pointerEvents="none" />
        <View
          pointerEvents="none"
          style={[
            styles.track,
            {
              backgroundColor: colors.accent,
              left: toX(value[0]) + THUMB / 2,
              right: usable - toX(value[1]) + THUMB / 2
            }
          ]}
        />
        {([0, 1] as const).map((which) => (
          <View
            key={which}
            pointerEvents="none"
            style={[styles.thumb, { left: toX(value[which]), backgroundColor: colors.surface, borderColor: colors.accent }]}
          />
        ))}
      </View>

      <View style={styles.labels}>
        <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
          {formatMoney({ amountMinor: value[0], currency })}
        </ThemedText>
        <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
          {formatMoney({ amountMinor: value[1], currency })}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  histogram: { height: HISTOGRAM_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  // Taller than the thumb so the whole strip is draggable, not just the circles.
  trackRow: { height: 44, justifyContent: 'center' },
  track: { position: 'absolute', left: 0, right: 0, height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2 },
  thumb: { position: 'absolute', width: THUMB, height: THUMB, borderRadius: THUMB / 2, borderWidth: 3 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  label: { fontFamily: fontFamilies.semibold, fontSize: 13, lineHeight: 17 }
});
