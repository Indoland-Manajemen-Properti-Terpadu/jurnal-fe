import type { NegativeNumberFormat } from '@/module/settings';

export type ProfitLossRowType =
  | 'title'
  | 'head'
  | 'account'
  | 'subtotal'
  | 'total'
  | 'profit'
  | 'blank';

/** One line of the statement as the server draws it, in print order. */
export interface ProfitLossRow {
  type: ProfitLossRowType;
  /** What a total, profit or title line is (`revenue`, `grossProfit`, `tax`, ...); `null` on others. */
  key: string | null;
  /** The account's id (heads and accounts). */
  accountId: string;
  /** On a subtotal: the id of the head account it adds up. */
  groupId: string | null;
  /** On an account: the id of its parent account, or `null` when it stands alone. */
  parentId: string | null;
  accountNumber: string;
  label: string;
  /** Signed; `null` on lines that carry no figure (a title, a head, a blank). */
  amount: number | null;
  isContra: boolean;
}

export interface ProfitLossSection {
  key: string;
  title: string;
  total: number;
}

export interface ProfitLossSummary {
  /** Revenue before discounts and returns. */
  grossRevenue: number;
  /** Discounts and returns (contra revenue) taken off the gross revenue. */
  totalContra: number;
  /** Gross revenue less contra; the same figure as `totalRevenue`. */
  netRevenue: number;
  totalRevenue: number;
  totalDirectCost: number;
  grossProfit: number;
  totalOpex: number;
  profitAfterOpex: number;
  totalOtherIncome: number;
  totalOtherExpense: number;
  profitNett: number;
  totalTaxes: number;
  profitAfterTax: number;
}

export interface ProfitLossStatementAccount {
  id: string;
  code: string;
  name: string;
  category: string | null;
  balance: number;
}

export interface ProfitLossStatementSection {
  key: string;
  label: string;
  normal: 'debit' | 'credit';
  total: number;
  accounts: ProfitLossStatementAccount[];
}

export interface ProfitLossStatementTotals {
  pendapatan: number;
  hpp: number;
  beban: number;
  lain_masuk: number;
  lain_keluar: number;
  pajak: number;
  laba_kotor: number;
  laba_operasional: number;
  laba_sebelum_pajak: number;
  laba_bersih: number;
}

export interface ProfitLossStatement {
  from: string;
  to: string;
  label: string;
  sections: ProfitLossStatementSection[];
  totals: ProfitLossStatementTotals;
  journalCount: number;
  modules: Record<string, number>;
}

export interface ProfitLossStatementPair {
  current: ProfitLossStatement;
  compare: ProfitLossStatement | null;
}

export interface ProfitLossReport {
  startDate: string;
  endDate: string;
  /** Decimal places the server rounded the amounts to; absent on an older server. */
  precision?: number;
  negativeFormat?: NegativeNumberFormat;
  sections: ProfitLossSection[];
  summary: ProfitLossSummary;
  rows: ProfitLossRow[];
  /** Available from the current profit-loss endpoint; absent on older backend versions. */
  statement?: ProfitLossStatementPair;
}

export interface ProfitLossPagination {
  page: number;
  totalPages: number;
}

export type ProfitLossExportType = 'pdf' | 'xlsx' | 'csv';
