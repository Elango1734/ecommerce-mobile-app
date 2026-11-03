import { formatMoney } from '@/utils/money';

describe('formatMoney', () => {
  it('formats integer minor units as a currency string', () => {
    expect(formatMoney({ amountMinor: 1999, currency: 'USD' })).toBe('$19.99');
  });

  it('formats a zero amount', () => {
    expect(formatMoney({ amountMinor: 0, currency: 'USD' })).toBe('$0.00');
  });

  it('respects a different currency code', () => {
    expect(formatMoney({ amountMinor: 500, currency: 'EUR' })).toContain('5.00');
  });

  it('returns a placeholder for null/undefined', () => {
    expect(formatMoney(null)).toBe('—');
    expect(formatMoney(undefined)).toBe('—');
  });
});
