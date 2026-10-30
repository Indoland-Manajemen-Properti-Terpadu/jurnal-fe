import { describe, expect, it } from 'vitest';
import { roundToCents, sameAmount, subtractAmounts, sumAmounts } from './dashboardMoney';

describe('dashboardMoney', () => {
  it('rounds half up to the cent at the input boundary', () => {
    expect(roundToCents(1.005)).toBe(1.01);
    expect(roundToCents(1500.504)).toBe(1500.5);
    expect(roundToCents(-1.005)).toBe(-1.01);
    expect(Object.is(roundToCents(-0.004), 0)).toBe(true);
  });

  it('keeps whole rupiah unchanged', () => {
    expect(roundToCents(150_000_000)).toBe(150_000_000);
    expect(sumAmounts([150_000_000, 50_000_000, -20_000_000])).toBe(180_000_000);
    expect(subtractAmounts(200_000_000, 120_000_000)).toBe(80_000_000);
  });

  it('avoids binary float artefacts', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(sumAmounts([0.1, 0.2])).toBe(0.3);
    expect(sameAmount(0.1 + 0.2, 0.3)).toBe(true);
    expect(sameAmount(0.3, 0.31)).toBe(false);
  });

  it('rejects non-finite amounts', () => {
    expect(() => sumAmounts([Number.NaN])).toThrow(RangeError);
  });
});
