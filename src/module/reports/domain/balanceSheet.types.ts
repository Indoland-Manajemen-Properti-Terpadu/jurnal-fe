import type { NegativeNumberFormat } from '@/module/settings';

export interface BalanceSheetAccountItem {
  accountId: string | null;
  accountNumber: string | null;
  accountName: string;
  categoryId: string | null;
  categoryName: string | null;
  balance: number;
  derived?: boolean;
  extra?: number;
  overdraft?: boolean;
}

export interface BalanceSheetGroupData {
  key: string;
  label: string;
  total: number;
  accounts: BalanceSheetAccountItem[];
}

export interface BalanceSheetSectionData {
  key: string;
  label: string;
  total: number;
  groups: BalanceSheetGroupData[];
}

export interface BalanceSheetCalloutAccount {
  accountNumber: string | null;
  accountName: string;
  balance: number;
}

export interface BalanceSheetSnapshot {
  endDate: string;
  precision?: number;
  negativeFormat?: NegativeNumberFormat;
  sections: BalanceSheetSectionData[];
  assets: BalanceSheetAssets;
  liabilities: BalanceSheetLiabilities;
  equity: BalanceSheetAccountItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  discrepancy: number;
  journalCount?: number;
  modules?: Record<string, number>;
  currentYearProfit?: number;
  priorYearProfit?: number;
  unmapped: BalanceSheetCalloutAccount[];
  overdrafts: BalanceSheetCalloutAccount[];
}

export interface BalanceSheetAssets {
  currentAssets: BalanceSheetAccountItem[];
  nonCurrentAssets: BalanceSheetAccountItem[];
  depreciationAmortization: BalanceSheetAccountItem[];
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalDepreciationAmortization: number;
  netNonCurrentAssets?: number;
  calculatedTotal: number;
}

export interface BalanceSheetLiabilities {
  currentLiabilities: BalanceSheetAccountItem[];
  nonCurrentLiabilities: BalanceSheetAccountItem[];
  totalCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  allLiabilities: BalanceSheetAccountItem[];
  calculatedTotal: number;
}

export interface BalanceSheetData extends BalanceSheetSnapshot {
  startDate?: string;
  compareAsOf?: string;
  compare?: BalanceSheetSnapshot | null;
}

export interface BalanceSheetQueryParams {
  startDate: string;
  endDate: string;
  comparePeriod?: { startDate: string; endDate: string };
}

export type BalanceSheetComparison =
  | 'none'
  | 'previous_period'
  | 'same_period_last_year'
  | 'custom';
export type BalanceSheetViewMode = 'rinci' | 'ringkas';

export type BalanceSheetExportType = 'pdf' | 'xlsx' | 'csv';
