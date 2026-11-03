import type { VariantDto } from '@shopsphere/api-client';

/** Every variant's attribute keys, deduplicated — the set of selectable dimensions (e.g. "color", "size"). */
export function getAttributeNames(variants: VariantDto[]): string[] {
  const names = new Set<string>();
  variants.forEach((v) => Object.keys(v.attributes).forEach((k) => names.add(k)));
  return [...names];
}

function variantMatchesSelection(variant: VariantDto, selection: Record<string, string>): boolean {
  return Object.entries(selection).every(([key, value]) => variant.attributes[key] === value);
}

/**
 * Resolves which variant (if any) the customer's current selection points
 * to. Deliberately returns `undefined` until every dimension has been
 * explicitly chosen — `Object.entries({}).every(...)` is vacuously `true`,
 * so without this guard an empty selection would silently resolve to
 * whichever variant happens to be first in the array, letting a customer
 * add an arbitrary color/size to their cart without ever choosing one.
 */
export function resolveSelectedVariant(
  variants: VariantDto[],
  attributeNames: string[],
  selection: Record<string, string>
): VariantDto | undefined {
  if (variants.length === 1) return variants[0];
  const hasPickedEveryDimension = attributeNames.every((name) => name in selection);
  if (!hasPickedEveryDimension) return undefined;
  return variants.find((v) => variantMatchesSelection(v, selection));
}
