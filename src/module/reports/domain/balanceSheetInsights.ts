import type { BalanceSheetAccountItem, BalanceSheetData } from './balanceSheet.types';
import { percentOf } from './reportFormat';

export interface CompositionSlice {
  key: string;
  /** Category name; empty for the "others" slice. */
  name: string;
  value: number;
  /** Share of the positive total, 0 to 100. */
  share: number;
}

/** Sum of the positive balances, grouped by category; the smallest categories beyond `top` become one "others" slice. */
export const composeByCategory = (
  items: BalanceSheetAccountItem[],
  top = 5
): CompositionSlice[] => {
  const sums = new Map<string, number>();
  items.forEach((item) => {
    if (item.balance <= 0) return;
    const name = item.categoryName || '';
    sums.set(name, (sums.get(name) ?? 0) + item.balance);
  });
  const total = [...sums.values()].reduce((sum, value) => sum + value, 0);
  const sorted = [...sums.entries()].sort((a, b) => b[1] - a[1]);
  const head = sorted.slice(0, top);
  const rest = sorted.slice(top).reduce((sum, [, value]) => sum + value, 0);

  const slices = head.map(([name, value]) => ({
    key: name || 'uncategorized',
    name,
    value,
    share: percentOf(value, total),
  }));
  if (rest > 0) {
    slices.push({ key: 'others', name: '', value: rest, share: percentOf(rest, total) });
  }
  return slices;
};

export interface FundingStructure {
  liabilitiesShare: number;
  equityShare: number;
}

/** How the assets are financed: the share of liabilities and of equity in liabilities plus equity. */
export const fundingStructure = (data: BalanceSheetData): FundingStructure => {
  const liabilities = Math.max(0, data.totalLiabilities);
  const equity = Math.max(0, data.totalEquity);
  const total = liabilities + equity;
  return { liabilitiesShare: percentOf(liabilities, total), equityShare: percentOf(equity, total) };
};

/** All accounts of the asset side, for the composition by category. */
export const assetAccounts = (data: BalanceSheetData): BalanceSheetAccountItem[] => [
  ...data.assets.currentAssets,
  ...data.assets.nonCurrentAssets,
];

/** How well assets and liabilities plus equity match, 0 to 100 (100 when equal). */
export const matchRate = (assets: number, liabilitiesAndEquity: number): number =>
  assets === liabilitiesAndEquity
    ? 100
    : percentOf(Math.min(assets, liabilitiesAndEquity), Math.max(assets, liabilitiesAndEquity));
