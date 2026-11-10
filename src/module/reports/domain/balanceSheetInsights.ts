import type { BalanceSheetData } from './balanceSheet.types';
import { percentOf } from './reportFormat';

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

/**
 * Current assets over current liabilities: how many times the short-term obligations are covered.
 * `null` when there are no current liabilities to compare with.
 */
export const currentRatio = (data: BalanceSheetData): number | null =>
  data.liabilities.totalCurrentLiabilities > 0
    ? data.assets.totalCurrentAssets / data.liabilities.totalCurrentLiabilities
    : null;

/** The share of current assets in the total assets, 0 to 100, or `null` without assets. */
export const currentAssetsShare = (data: BalanceSheetData): number | null =>
  data.totalAssets > 0 ? percentOf(data.assets.totalCurrentAssets, data.totalAssets) : null;
