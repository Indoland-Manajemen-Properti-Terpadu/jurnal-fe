import { describe, expect, it } from 'vitest';
import { fromCents, roundToCents, toCents } from './saleMoney';

describe('saleMoney', () => {
  it('converts to cents and back', () => {
    expect(toCents(1500.5)).toBe(150050);
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(fromCents(150050)).toBe(1500.5);
  });

  it('rounds half up to the cent despite float representation', () => {
    expect(roundToCents(1.005)).toBe(1.01);
    expect(roundToCents(1500.505)).toBe(1500.51);
    expect(roundToCents(2.675)).toBe(2.68);
    expect(roundToCents(1500.504)).toBe(1500.5);
  });

  it('rounds negative adjustments symmetrically (half away from zero)', () => {
    expect(roundToCents(-1.005)).toBe(-1.01);
    expect(roundToCents(-250.755)).toBe(-250.76);
    expect(roundToCents(-0.004)).toBe(0);
    expect(Object.is(roundToCents(-0.004), 0)).toBe(true);
  });

  it('keeps whole rupiah unchanged', () => {
    expect(roundToCents(1500000)).toBe(1500000);
    expect(roundToCents(-75000)).toBe(-75000);
  });

  it('rejects non-finite amounts', () => {
    expect(() => toCents(Number.NaN)).toThrow(RangeError);
    expect(() => toCents(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});
