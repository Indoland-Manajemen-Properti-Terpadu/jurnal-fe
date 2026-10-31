export interface BalanceSheetAccountItem {
  accountId: string | null;
  accountNumber: string | null;
  accountName: string;
  categoryId: string | null;
  categoryName: string | null;
  balance: number;
}

export interface BalanceSheetAssets {
  currentAssets: BalanceSheetAccountItem[];
  nonCurrentAssets: BalanceSheetAccountItem[];
  depreciationAmortization: BalanceSheetAccountItem[];
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalDepreciationAmortization: number;
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

export interface BalanceSheetData {
  endDate: string;
  startDate?: string;
  assets: BalanceSheetAssets;
  liabilities: BalanceSheetLiabilities;
  equity: BalanceSheetAccountItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  discrepancy: number;
}

export interface BalanceSheetQueryParams {
  startDate: string;
  endDate: string;
}

export type BalanceSheetExportType = 'pdf' | 'xlsx' | 'csv';
