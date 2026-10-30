import { describe, expect, it } from 'vitest';
import { getAgingTotals, getTrendTotals, sumPositive } from './dashboardTotals';

const point = (invoiced: number, collected: number) => ({
  key: 'k',
  label: 'l',
  invoiced,
  collected,
});
const bucket = (amount: number, count: number) => ({
  key: 'k',
  label: 'l',
  amount,
  count,
  color: 'red',
});

describe('dashboardTotals', () => {
  it('sums the six month trend for whole rupiah (same as a plain reduce)', () => {
    const pts = [point(1_000_000, 400_000), point(2_500_000, 2_500_000), point(0, 0)];
    expect(getTrendTotals(pts)).toEqual({
      invoiced: 3_500_000,
      collected: 2_900_000,
      uncollected: 600_000,
    });
  });

  it('never reports a negative uncollected total', () => {
    expect(getTrendTotals([point(100, 300)]).uncollected).toBe(0);
  });

  it('does not drift on decimals', () => {
    const t = getTrendTotals([point(0.1, 0.1), point(0.2, 0.1)]);
    expect(t.invoiced).toBe(0.3);
    expect(t.uncollected).toBe(0.1);
  });

  it('sums aging buckets and counts', () => {
    expect(getAgingTotals([bucket(6_000_000, 1), bucket(2_500_000, 2)])).toEqual({
      amount: 8_500_000,
      count: 3,
    });
    expect(getAgingTotals([bucket(1500.5, 1), bucket(0.1, 1), bucket(0.2, 1)]).amount).toBe(1500.8);
  });

  it('sums only positive balances', () => {
    expect(sumPositive([150_000_000, -5_000_000, 50_000_000])).toBe(200_000_000);
    expect(sumPositive([1500.5, 0.1, 0.2])).toBe(1500.8);
    expect(sumPositive([])).toBe(0);
  });
});
