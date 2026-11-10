import type { BalanceSheetData } from './balanceSheet.types';
import { currentAssetsShare, currentRatio, fundingStructure } from './balanceSheetInsights';

const data = (overrides: Partial<BalanceSheetData> = {}): BalanceSheetData =>
  ({
    totalAssets: 1000,
    totalLiabilities: 250,
    totalEquity: 750,
    assets: { totalCurrentAssets: 800, totalNonCurrentAssets: 200 },
    liabilities: { totalCurrentLiabilities: 200, totalNonCurrentLiabilities: 50 },
    ...overrides,
  }) as BalanceSheetData;

describe('fundingStructure', () => {
  it('splits liabilities plus equity into two shares', () => {
    expect(fundingStructure(data())).toEqual({ liabilitiesShare: 25, equityShare: 75 });
  });

  it('ignores a negative side and copes with nothing at all', () => {
    expect(fundingStructure(data({ totalLiabilities: -5, totalEquity: 100 }))).toEqual({
      liabilitiesShare: 0,
      equityShare: 100,
    });
    expect(fundingStructure(data({ totalLiabilities: 0, totalEquity: 0 }))).toEqual({
      liabilitiesShare: 0,
      equityShare: 0,
    });
  });
});

describe('currentRatio', () => {
  it('is current assets over current liabilities', () => {
    expect(currentRatio(data())).toBe(4);
  });

  it('is null when there are no current liabilities', () => {
    expect(
      currentRatio(
        data({
          liabilities: { totalCurrentLiabilities: 0, totalNonCurrentLiabilities: 0 },
        } as Partial<BalanceSheetData>)
      )
    ).toBeNull();
  });
});

describe('currentAssetsShare', () => {
  it('is the share of current assets in the total assets', () => {
    expect(currentAssetsShare(data())).toBe(80);
  });

  it('is null without assets', () => {
    expect(currentAssetsShare(data({ totalAssets: 0 }))).toBeNull();
  });
});
