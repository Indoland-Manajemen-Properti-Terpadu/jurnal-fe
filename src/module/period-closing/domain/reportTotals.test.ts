import { groupByCategory, sumAmounts } from './reportTotals';

describe('sumAmounts', () => {
  it('adds whole and decimal amounts exactly', () => {
    expect(sumAmounts([{ amount: 1000.5 }, { amount: 0.25 }])).toBe(1000.75);
  });

  it('has no float drift: 0.1 + 0.2 is 0.3', () => {
    expect(sumAmounts([{ amount: 0.1 }, { amount: 0.2 }])).toBe(0.3);
  });

  it('counts missing, null and zero amounts as zero', () => {
    expect(sumAmounts([{}, { amount: null }, { amount: 0 }, { amount: 5 }])).toBe(5);
  });

  it('rounds each amount half up to the cent', () => {
    expect(sumAmounts([{ amount: 1.005 }, { amount: 1.005 }])).toBe(2.02);
    expect(sumAmounts([{ amount: 0.004 }])).toBe(0);
  });

  it('keeps negative amounts and large totals exact', () => {
    expect(sumAmounts([{ amount: -10.1 }, { amount: 3.3 }])).toBe(-6.8);
    expect(sumAmounts([{ amount: 9999999999.99 }, { amount: 0.01 }])).toBe(10000000000);
  });

  it('is zero for an empty list', () => {
    expect(sumAmounts([])).toBe(0);
  });

  it('rejects non finite input', () => {
    expect(() => sumAmounts([{ amount: Number.POSITIVE_INFINITY }])).toThrow(RangeError);
  });
});

describe('groupByCategory', () => {
  it('groups by category name and uses the fallback when it is missing', () => {
    const groups = groupByCategory(
      [
        { id: 1, category: { name: 'Assets' } },
        { id: 2, category: undefined },
        { id: 3, category: { name: '' } },
        { id: 4, category: { name: 'Assets' } },
      ],
      'Uncategorized'
    );

    expect(Object.keys(groups)).toEqual(['Assets', 'Uncategorized']);
    expect(groups.Assets.map((item) => item.id)).toEqual([1, 4]);
    expect(groups.Uncategorized.map((item) => item.id)).toEqual([2, 3]);
  });
});
