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

export interface ProfitLossReport {
  startDate: string;
  endDate: string;
  sections: ProfitLossSection[];
  summary: ProfitLossSummary;
  rows: ProfitLossRow[];
}

export interface ProfitLossPagination {
  page: number;
  totalPages: number;
}

export type ProfitLossExportType = 'pdf' | 'xlsx' | 'csv';
