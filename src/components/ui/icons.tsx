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

/* ------------------------------------------------------------------ *
 * Evira flow icons.
 *
 * The kit's own icons could not be exported: 93 of its 96 screens are
 * flattened bitmaps in the preview file, so no vector geometry exists to
 * pull. These are Lucide paths (ISC) on the same 24x24 grid, chosen to
 * match the kit's outline weight and rounded caps.
 * ------------------------------------------------------------------ */

export function ArrowLeftGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M19 12H5" />
      <Path d="m12 19-7-7 7-7" />
    </Glyph>
  );
}

export function ChevronRightGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="m9 18 6-6-6-6" />
    </Glyph>
  );
}

export function ChevronDownGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="m6 9 6 6 6-6" />
    </Glyph>
  );
}

export function CloseGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M18 6 6 18" />
      <Path d="m6 6 12 12" />
    </Glyph>
  );
}

export function BellGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <Path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
    </Glyph>
  );
}

export function HeartGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </Glyph>
  );
}

export function HeartFilledGlyph({ size = 22, color }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </Svg>
  );
}

export function FilterGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M10 5H3" />
      <Path d="M21 5h-7" />
      <Path d="M14 19H3" />
      <Path d="M21 19h-7" />
      <Path d="M10 12H3" />
      <Path d="M21 12h-5" />
      <Circle cx="12" cy="5" r="2" />
      <Circle cx="16" cy="12" r="2" />
      <Circle cx="12" cy="19" r="2" />
    </Glyph>
  );
}

export function EyeGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <Circle cx="12" cy="12" r="3" />
    </Glyph>
  );
}

export function EyeOffGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <Path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <Path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <Path d="m2 2 20 20" />
    </Glyph>
  );
}

export function LockGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Glyph>
  );
}

export function MailGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
      <Rect x="2" y="4" width="20" height="16" rx="2" />
    </Glyph>
  );
}

export function StarGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 20.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 8.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </Glyph>
  );
}

export function StarFilledGlyph({ size = 22, color }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 20.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 8.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </Svg>
  );
}

export function PlusGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M5 12h14" />
      <Path d="M12 5v14" />
    </Glyph>
  );
}

export function MinusGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M5 12h14" />
    </Glyph>
  );
}

export function TrashGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M3 6h18" />
      <Path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <Path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </Glyph>
  );
}

export function CheckGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M20 6 9 17l-5-5" />
    </Glyph>
  );
}

export function CheckCircleGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="m9 12 2 2 4-4" />
    </Glyph>
  );
}

export function MapPinGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <Circle cx="12" cy="10" r="3" />
    </Glyph>
  );
}

export function CreditCardGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Rect width="20" height="14" x="2" y="5" rx="2" />
      <Path d="M2 10h20" />
    </Glyph>
  );
}

export function WalletGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <Path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </Glyph>
  );
}

export function ShieldGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </Glyph>
  );
}

export function GlobeGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <Path d="M2 12h20" />
    </Glyph>
  );
}

export function HelpCircleGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <Path d="M12 17h.01" />
    </Glyph>
  );
}

export function MessageGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </Glyph>
  );
}

export function LogOutGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="m16 17 5-5-5-5" />
      <Path d="M21 12H9" />
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    </Glyph>
  );
}

export function FingerprintGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
      <Path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
      <Path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
      <Path d="M2 12a10 10 0 0 1 18-6" />
      <Path d="M2 16h.01" />
      <Path d="M21.8 16c.2-2 .131-5.354 0-6" />
      <Path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
      <Path d="M8.65 22c.21-.66.45-1.32.57-2" />
      <Path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
    </Glyph>
  );
}

export function CameraGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <Circle cx="12" cy="13" r="3" />
    </Glyph>
  );
}

export function CalendarGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M8 2v4" />
      <Path d="M16 2v4" />
      <Rect width="18" height="18" x="3" y="4" rx="2" />
      <Path d="M3 10h18" />
    </Glyph>
  );
}

export function TagGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <Circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </Glyph>
  );
}

export function TruckGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <Path d="M15 18H9" />
      <Path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <Circle cx="17" cy="18" r="2" />
      <Circle cx="7" cy="18" r="2" />
    </Glyph>
  );
}

export function PackageGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <Path d="M12 22V12" />
      <Path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
      <Path d="m7.5 4.27 9 5.15" />
    </Glyph>
  );
}

export function EditGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <Path d="m15 5 4 4" />
    </Glyph>
  );
}

export function PhoneGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
    </Glyph>
  );
}

export function UsersGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Glyph>
  );
}

export function FileTextGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
      <Path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <Path d="M10 9H8" />
      <Path d="M16 13H8" />
      <Path d="M16 17H8" />
    </Glyph>
  );
}

export function ClockGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 6v6l4 2" />
    </Glyph>
  );
}

export function BagGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <Path d="M3 6h18" />
      <Path d="M16 10a4 4 0 0 1-8 0" />
    </Glyph>
  );
}

export function MoreGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Circle cx="12" cy="12" r="1" />
      <Circle cx="12" cy="5" r="1" />
      <Circle cx="12" cy="19" r="1" />
    </Glyph>
  );
}

export function SendGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <Path d="m21.854 2.147-10.94 10.939" />
    </Glyph>
  );
}

export function ShareGlyph(p: GlyphProps) {
  return (
    <Glyph {...p}>
      <Path d="M12 2v13" />
      <Path d="m16 6-4-4-4 4" />
      <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    </Glyph>
  );
}
