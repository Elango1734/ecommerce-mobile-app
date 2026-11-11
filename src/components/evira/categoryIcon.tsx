import React from 'react';
import {
  BagGlyph,
  BasketGlyph,
  BookGlyph,
  DropletGlyph,
  HouseGlyph,
  ShirtGlyph,
  TrophyGlyph,
  ZapGlyph,
  type GlyphProps
} from '@/components/ui/icons';

/**
 * The kit draws a bespoke illustrated icon per category (Clothes, Shoes,
 * Bags...) that doesn't exist for this backend's actual categories (Beauty,
 * Books, Electronics, Fashion, Groceries, Home, Sports — see
 * GET /api/v1/categories). Map by slug keyword with a sensible default
 * rather than hardcoding the kit's 8 categories, which don't exist here.
 */
const MATCHERS: Array<[RegExp, React.ComponentType<GlyphProps>]> = [
  [/beauty|cosmetic|skin/, DropletGlyph],
  [/book|read|stationery/, BookGlyph],
  [/electronic|tech|gadget|computer|phone/, ZapGlyph],
  [/fashion|cloth|apparel|wear/, ShirtGlyph],
  [/grocery|food|grocer/, BasketGlyph],
  [/home|furniture|kitchen|decor/, HouseGlyph],
  [/sport|fitness|outdoor/, TrophyGlyph]
];

export function categoryIcon(slugOrName: string): React.ComponentType<GlyphProps> {
  const key = slugOrName.toLowerCase();
  return MATCHERS.find(([re]) => re.test(key))?.[1] ?? BagGlyph;
}
