import { describe, expect, it } from 'vitest';
import { money, monthYear } from './types';

describe('admin formatting', () => {
  it('formats integer minor-unit money without floating-point arithmetic', () => {
    expect(money({ amountMinor: 24900, currency: 'INR' })).toContain('249');
  });
  it('formats publication month and year only', () => {
    expect(monthYear(8, 2026)).toBe('Aug 2026');
  });
});
