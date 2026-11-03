import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface GlyphProps {
  size?: number;
  color: string;
  strokeWidth?: number;
}

/**
 * Line-icon set drawn as real SVG paths (geometry from the Lucide icon set,
 * ISC-licensed) on a 24x24 grid.
 *
 * These replaced an earlier zero-dependency set built from plain `View`
 * borders and rotations: that approach can't produce curves, mitred corners
 * or round line caps, so the glyphs read as homemade at tab-bar sizes.
 * Every icon below takes `color` on `stroke`, so the tab bar can still tint
 * them for the active/inactive state (the original reason emoji were ruled
 * out — emoji render in fixed system colors).
 */
function Glyph({ size = 22, color, strokeWidth = 2, children }: GlyphProps & { children: React.ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

export function HomeGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <Path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Path d="M9 22V12h6v10" />
    </Glyph>
  );
}

export function SearchGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <Circle cx="11" cy="11" r="8" />
      <Path d="m21 21-4.3-4.3" />
    </Glyph>
  );
}

export function CartGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <Path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <Path d="M3 6h18" />
      <Path d="M16 10a4 4 0 0 1-8 0" />
    </Glyph>
  );
}

export function ListGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <Path d="M8 6h13" />
      <Path d="M8 12h13" />
      <Path d="M8 18h13" />
      <Path d="M3 6h.01" />
      <Path d="M3 12h.01" />
      <Path d="M3 18h.01" />
    </Glyph>
  );
}

export function GridGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <Rect width="7" height="7" x="3" y="3" rx="1.5" />
      <Rect width="7" height="7" x="14" y="3" rx="1.5" />
      <Rect width="7" height="7" x="14" y="14" rx="1.5" />
      <Rect width="7" height="7" x="3" y="14" rx="1.5" />
    </Glyph>
  );
}

export function GearGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <Circle cx="12" cy="12" r="3" />
    </Glyph>
  );
}

export function UserGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Glyph>
  );
}

/** Solid four-point star for the Sphere AI launcher — filled, not stroked, so it reads at a glance on the accent pill. */
export function SparklesGlyph({ size = 22, color }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </Svg>
  );
}
