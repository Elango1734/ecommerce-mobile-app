import { getAttributeNames, resolveSelectedVariant } from '@/utils/variants';
import type { VariantDto } from '@shopsphere/api-client';

function makeVariant(id: string, attributes: Record<string, string>, availableQuantity = 10): VariantDto {
  return {
    id,
    sku: `SKU-${id}`,
    attributes,
    price: { amountMinor: 1000, currency: 'USD' },
    regularPrice: { amountMinor: 1000, currency: 'USD' },
    salePrice: null,
    status: 'active',
    availableQuantity
  };
}

describe('resolveSelectedVariant', () => {
  it('returns the single variant immediately when a product has only one', () => {
    const variants = [makeVariant('a', {})];
    expect(resolveSelectedVariant(variants, [], {})).toBe(variants[0]);
  });

  it('regression: does NOT resolve to an arbitrary variant before every dimension is picked', () => {
    // This is the exact bug caught via simulator screenshot: Object.entries({}).every(...) is vacuously
    // true, so an empty selection must not match the first variant in the array.
    const variants = [
      makeVariant('black-m', { color: 'Black', size: 'M' }),
      makeVariant('black-l', { color: 'Black', size: 'L' }),
      makeVariant('white-m', { color: 'White', size: 'M' })
    ];
    const attributeNames = getAttributeNames(variants);

    expect(resolveSelectedVariant(variants, attributeNames, {})).toBeUndefined();
    expect(resolveSelectedVariant(variants, attributeNames, { color: 'Black' })).toBeUndefined();
  });

  it('resolves once every dimension is selected', () => {
    const variants = [
      makeVariant('black-m', { color: 'Black', size: 'M' }, 40),
      makeVariant('black-l', { color: 'Black', size: 'L' }, 25),
      makeVariant('white-m', { color: 'White', size: 'M' }, 0)
    ];
    const attributeNames = getAttributeNames(variants);

    const resolved = resolveSelectedVariant(variants, attributeNames, { color: 'Black', size: 'L' });
    expect(resolved?.id).toBe('black-l');
    expect(resolved?.availableQuantity).toBe(25);
  });

  it('getAttributeNames deduplicates across all variants', () => {
    const variants = [makeVariant('a', { color: 'Black', size: 'M' }), makeVariant('b', { color: 'White', size: 'L' })];
    expect(getAttributeNames(variants).sort()).toEqual(['color', 'size']);
  });
});
