import { fromMinor, sumMinor, toMinor } from './money';

describe('toMinor', () => {
  it('avoids float drift when adding amounts', () => {
    expect(toMinor(0.1) + toMinor(0.2)).toBe(toMinor(0.3));
    expect(toMinor(0.1) + toMinor(0.2)).toBe(30);
  });

  it('accepts the result of float arithmetic within tolerance', () => {
    expect(toMinor(0.1 + 0.2)).toBe(30);
  });

  it('parses decimal strings without floats', () => {
    expect(toMinor('1500.50')).toBe(150050);
    expect(toMinor('10.1')).toBe(1010);
    expect(toMinor('-5.25')).toBe(-525);
    expect(toMinor('7')).toBe(700);
  });

  it('returns +0 for negative zero', () => {
    expect(Object.is(toMinor('-0'), 0)).toBe(true);
    expect(Object.is(toMinor(-0), 0)).toBe(true);
  });

  it('rejects more than two decimal places instead of inventing a rounding rule', () => {
    expect(() => toMinor(1.005)).toThrow(RangeError);
    expect(() => toMinor('1.005')).toThrow(RangeError);
  });

  it('rejects malformed input', () => {
    expect(() => toMinor(NaN)).toThrow(RangeError);
    expect(() => toMinor(Infinity)).toThrow(RangeError);
    expect(() => toMinor('')).toThrow(RangeError);
    expect(() => toMinor('1,500.50')).toThrow(RangeError);
    expect(() => toMinor('1e3')).toThrow(RangeError);
    expect(() => toMinor('abc')).toThrow(RangeError);
  });
});

describe('fromMinor', () => {
  it('formats integer minor units as a two-decimal string', () => {
    expect(fromMinor(150050)).toBe('1500.50');
    expect(fromMinor(-525)).toBe('-5.25');
    expect(fromMinor(5)).toBe('0.05');
    expect(fromMinor(0)).toBe('0.00');
  });

  it('rejects non-integers', () => {
    expect(() => fromMinor(1.5)).toThrow(RangeError);
    expect(() => fromMinor(NaN)).toThrow(RangeError);
  });
});

describe('sumMinor', () => {
  it('sums integers exactly', () => {
    expect(sumMinor([toMinor(0.1), toMinor(0.2)])).toBe(30);
  });

  it('returns 0 for an empty list', () => {
    expect(sumMinor([])).toBe(0);
  });
});
