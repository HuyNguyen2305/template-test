import { describe, expect, test } from '@jest/globals';
import {
  computeItemTotals,
  roundDecimalToScaledInt,
} from '#common/money.js';

describe('money', () => {
  describe('roundDecimalToScaledInt', () => {
    test('rounds an IEEE-754 boundary case correctly (regression: 1.005 * 1)', () => {
      expect(roundDecimalToScaledInt(1.005, 1, 2)).toBe(101);
    });

    test('multiplies typical 2-decimal cost by integer qty', () => {
      expect(roundDecimalToScaledInt(29.99, 3, 2)).toBe(8997);
    });

    test('multiplies cost by a fractional qty', () => {
      expect(roundDecimalToScaledInt(15, 7.15, 2)).toBe(10725);
      expect(roundDecimalToScaledInt(8.35, 2.15, 2)).toBe(1795);
    });

    test('handles zero', () => {
      expect(roundDecimalToScaledInt(0, 5, 2)).toBe(0);
    });

    test('handles the schema maximum value', () => {
      expect(roundDecimalToScaledInt(99999999.99, 1, 2)).toBe(9999999999);
    });

    test('rounds a fractional percentage to whole cents', () => {
      expect(roundDecimalToScaledInt(149.99, 7.375, 0)).toBe(1106);
      expect(roundDecimalToScaledInt(149.99, 8.625, 0)).toBe(1294);
      expect(roundDecimalToScaledInt(149.99, 6.125, 0)).toBe(919);
    });
  });

  describe('computeItemTotals', () => {
    test('regression: cost=1.005, qty=1 no longer misrounds to 1.00', () => {
      expect(computeItemTotals(1.005, 1, [])).toEqual({
        subtotal: 1.01,
        total: 1.01,
      });
    });

    test('computes subtotal for typical 2-decimal cost and integer qty', () => {
      expect(computeItemTotals(29.99, 3, [])).toEqual({
        subtotal: 89.97,
        total: 89.97,
      });
    });

    test('computes subtotal for a fractional qty', () => {
      expect(computeItemTotals(15, 7.15, [])).toEqual({
        subtotal: 107.25,
        total: 107.25,
      });
    });

    test('applies a single fractional tax rate', () => {
      expect(computeItemTotals(149.99, 1, [{ rate: 7.375 }])).toEqual({
        subtotal: 149.99,
        total: 161.05,
      });
    });

    test('applies multiple tax slots', () => {
      expect(
        computeItemTotals(100, 1, [{ rate: 8.375 }, { rate: 2 }]),
      ).toEqual({
        subtotal: 100,
        total: 110.38,
      });
    });

    test('handles zero cost', () => {
      expect(computeItemTotals(0, 5, [{ rate: 10 }])).toEqual({
        subtotal: 0,
        total: 0,
      });
    });

    test('handles the schema maximum cost value', () => {
      expect(computeItemTotals(99999999.99, 1, [])).toEqual({
        subtotal: 99999999.99,
        total: 99999999.99,
      });
    });
  });
});
