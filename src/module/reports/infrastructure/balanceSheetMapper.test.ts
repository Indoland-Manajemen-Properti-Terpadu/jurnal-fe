import { mapBalanceSheetResponse } from './balanceSheetMapper';

const params = { startDate: '2026-01-01', endDate: '2026-01-31' };
const item = (balance: unknown, extra: object = {}) => ({ accountName: 'Kas', balance, ...extra });

describe('mapBalanceSheetResponse', () => {
  it('reads string amounts with parseFloat and unusable values as 0', () => {
    const result = mapBalanceSheetResponse(
      { data: { assets: { currentAssets: [item('1500.50'), item('abc'), item(undefined)] } } },
      params
    );

    expect(result.assets.currentAssets.map((account) => account.balance)).toEqual([1500.5, 0, 0]);
    expect(result.assets.totalCurrentAssets).toBe(1500.5);
  });

  it('replaces a server section total of 0 with the sum of its items', () => {
    const result = mapBalanceSheetResponse(
      { data: { assets: { currentAssets: [item(200), item(300)], totalCurrentAssets: 0 } } },
      params
    );

    expect(result.assets.totalCurrentAssets).toBe(500);
  });

  it('keeps a non-zero server section total even when the items sum differently', () => {
    const result = mapBalanceSheetResponse(
      { data: { assets: { currentAssets: [item(200)], totalCurrentAssets: 999 } } },
      params
    );

    expect(result.assets.totalCurrentAssets).toBe(999);
  });

  it('keeps a server grand total of 0 because only null or undefined falls back', () => {
    const result = mapBalanceSheetResponse(
      { data: { assets: { currentAssets: [item(500)] }, totalAssets: 0 } },
      params
    );

    expect(result.totalAssets).toBe(0);
  });

  it('calculates the grand total from sections when the server sends none', () => {
    const result = mapBalanceSheetResponse(
      { data: { assets: { currentAssets: [item(500)], nonCurrentAssets: [item(250)] } } },
      params
    );

    expect(result.totalAssets).toBe(750);
    expect(result.assets.calculatedTotal).toBe(750);
  });

  it('ignores the server grand total when the payload is not wrapped in data', () => {
    const result = mapBalanceSheetResponse(
      { assets: { currentAssets: [item(500)] }, totalAssets: 12 },
      params
    );

    expect(result.totalAssets).toBe(500);
  });

  it('splits a flat liabilities list by category name', () => {
    const result = mapBalanceSheetResponse(
      {
        data: {
          liabilities: [
            item(100, { categoryName: 'Utang Lancar' }),
            item(40, { categoryName: 'Utang Jangka Panjang' }),
            item(10, { categoryName: null }),
          ],
        },
      },
      params
    );

    expect(result.liabilities.totalCurrentLiabilities).toBe(110);
    expect(result.liabilities.totalNonCurrentLiabilities).toBe(40);
  });

  it('reports balance state from assets against liabilities plus equity', () => {
    const balanced = mapBalanceSheetResponse(
      { data: { assets: { currentAssets: [item(500)] }, equity: [item(500)] } },
      params
    );
    const unbalanced = mapBalanceSheetResponse(
      { data: { assets: { currentAssets: [item(500)] }, equity: [item(400)] } },
      params
    );

    expect(balanced.isBalanced).toBe(true);
    expect(unbalanced.isBalanced).toBe(false);
    expect(unbalanced.discrepancy).toBe(100);
  });

  it('returns an empty, balanced report for an empty payload', () => {
    const result = mapBalanceSheetResponse({}, params);

    expect(result.totalAssets).toBe(0);
    expect(result.isBalanced).toBe(true);
    expect(result.startDate).toBe('2026-01-01');
    expect(result.endDate).toBe('2026-01-31');
  });
});
