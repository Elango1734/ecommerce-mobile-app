import React from 'react';
import { SvgXml } from 'react-native-svg';
import { undrawSvg } from '@/assets/illustrations/undraw';

export type IllustrationName = keyof typeof undrawSvg;

/** Renders a bundled unDraw illustration at a given square frame size, letterboxed to preserve its aspect ratio. */
export function Illustration({ name, size = 220 }: { name: IllustrationName; size?: number }) {
  const xml = undrawSvg[name];
  if (!xml) return null;
  return <SvgXml xml={xml} width={size} height={size} />;
}
