import type { BalanceSheetAccountItem, BalanceSheetData } from './balanceSheet.types';
import {
  assetAccounts,
  composeByCategory,
  fundingStructure,
  matchRate,
} from './balanceSheetInsights';

const item = (categoryName: string | null, balance: number): BalanceSheetAccountItem => ({
  accountId: null,
  accountNumber: null,
  accountName: 'x',
  categoryId: null,
  categoryName,
  balance,
});

describe('composeByCategory', () => {
  it('sums positive balances per category, largest first, with shares', () => {
    const slices = composeByCategory([
      item('Kas', 300),
      item('Piutang', 100),
      item('Kas', 100),
      item('Piutang', -50),
    ]);
    expect(slices.map((slice) => [slice.name, slice.value])).toEqual([
      ['Kas', 400],
      ['Piutang', 100],
    ]);
    expect(slices[0].share).toBe(80);
  });

  it('folds the categories beyond the top into one others slice', () => {
    const slices = composeByCategory([item('A', 50), item('B', 40), item('C', 6), item('D', 4)], 2);
    expect(slices.map((slice) => slice.key)).toEqual(['A', 'B', 'others']);
    expect(slices[2].value).toBe(10);
  });

  it('is empty without a positive balance', () => {
    expect(composeByCategory([item('A', 0), item(null, -5)])).toEqual([]);
  });
});

describe('fundingStructure', () => {
  it('splits liabilities plus equity into two shares', () => {
    const data = { totalLiabilities: 25, totalEquity: 75 } as BalanceSheetData;
    expect(fundingStructure(data)).toEqual({ liabilitiesShare: 25, equityShare: 75 });
  });

  it('is zero when there is nothing', () => {
    const data = { totalLiabilities: 0, totalEquity: 0 } as BalanceSheetData;
    expect(fundingStructure(data)).toEqual({ liabilitiesShare: 0, equityShare: 0 });
  });
});

describe('matchRate and assetAccounts', () => {
  it('is 100 when equal and the smaller over the larger otherwise', () => {
    expect(matchRate(100, 100)).toBe(100);
    expect(matchRate(100, 80)).toBe(80);
    expect(matchRate(0, 0)).toBe(100);
  });

  it('collects current and non-current assets', () => {
    const data = {
      assets: { currentAssets: [item('A', 1)], nonCurrentAssets: [item('B', 2)] },
    } as BalanceSheetData;
    expect(assetAccounts(data)).toHaveLength(2);
  });
});
