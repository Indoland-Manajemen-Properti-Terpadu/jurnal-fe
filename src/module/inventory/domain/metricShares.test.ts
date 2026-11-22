import { describe, expect, it } from 'vitest';
import { shareOfTotal, topShares } from './metricShares';

describe('topShares', () => {
  const items = [
    { key: 'a', label: 'Gudang Utama', value: 500 },
    { key: 'b', label: 'Gudang Lt. 2', value: 300 },
    { key: 'c', label: 'Gudang Lt. 3', value: 150 },
    { key: 'd', label: 'Gudang Lt. 4', value: 50 },
  ];

  it('keeps the largest and folds the rest into one "others" slice', () => {
    const shares = topShares(items, 2, 'Lainnya');

    expect(shares.map((share) => [share.label, share.value])).toEqual([
      ['Gudang Utama', 500],
      ['Gudang Lt. 2', 300],
      ['Lainnya', 200],
    ]);
  });

  it('gives each slice its whole-number percent of the total', () => {
    const shares = topShares(items, 2, 'Lainnya');

    expect(shares.map((share) => share.percent)).toEqual([50, 30, 20]);
  });

  it('does not add an "others" slice when everything fits', () => {
    expect(topShares(items.slice(0, 2), 3, 'Lainnya')).toHaveLength(2);
  });

  it('leaves out slices with nothing in them', () => {
    const shares = topShares(
      [...items.slice(0, 1), { key: 'z', label: 'Kosong', value: 0 }],
      3,
      'x'
    );

    expect(shares.map((share) => share.key)).toEqual(['a']);
  });

  it('returns nothing when there is nothing to share', () => {
    expect(topShares([], 3, 'x')).toEqual([]);
    expect(topShares([{ key: 'a', label: 'a', value: 0 }], 3, 'x')).toEqual([]);
  });

  it('never lets rounding push a slice over 100', () => {
    const shares = topShares(
      [
        { key: 'a', label: 'a', value: 1 },
        { key: 'b', label: 'b', value: 1 },
        { key: 'c', label: 'c', value: 1 },
      ],
      3,
      'x'
    );

    expect(shares.reduce((sum, share) => sum + share.percent, 0)).toBeLessThanOrEqual(100);
  });
});

describe('shareOfTotal', () => {
  it('is a whole-number percent, zero when the whole is zero', () => {
    expect(shareOfTotal(1, 3)).toBe(33);
    expect(shareOfTotal(3, 3)).toBe(100);
    expect(shareOfTotal(0, 0)).toBe(0);
  });

  it('stays between 0 and 100', () => {
    expect(shareOfTotal(5, 3)).toBe(100);
    expect(shareOfTotal(-1, 3)).toBe(0);
  });
});
