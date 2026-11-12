/** The five column groups of a trial balance, in print order. */
export const TRIAL_BALANCE_GROUPS = [
  'opening',
  'movement',
  'closing',
  'profitLoss',
  'balanceSheet',
] as const;

export type TrialBalanceGroup = (typeof TRIAL_BALANCE_GROUPS)[number];

/** One debit/credit pair of an account; an empty side is `null` (shown blank), never 0. */
export interface TrialBalanceCells {
  debit: number | null;
  credit: number | null;
}

/** One debit/credit pair of a total; the server always sends numbers here. */
export interface TrialBalanceSums {
  debit: number;
  credit: number;
}

export interface TrialBalanceAccount {
  id: string;
  accountNumber: string;
  name: string;
  categoryName: string;
  /** Category code of the chart of accounts (`KB` is cash and bank); empty when not sent. */
  categoryCode: string;
  /** A parent account: its figures already include its sub accounts, so it is never added up. */
  isHead: boolean;
  isContra: boolean;
  /** A group the account takes no part in (for example the profit and loss of an asset) is `null`. */
  opening: TrialBalanceCells | null;
  movement: TrialBalanceCells | null;
  closing: TrialBalanceCells | null;
  profitLoss: TrialBalanceCells | null;
  balanceSheet: TrialBalanceCells | null;
}

export interface TrialBalancePagination {
  page: number;
  limit: number;
  totalRows: number;
  totalPages: number;
}

export interface TrialBalanceReport {
  startDate: string;
  endDate: string;
  accounts: TrialBalanceAccount[];
  /** From the server; the page never adds the accounts up (a parent already holds its children). */
  totals: Record<TrialBalanceGroup, TrialBalanceSums>;
  /** The balancing line of the profit and loss and the balance sheet columns. */
  balancing: { profitLoss: TrialBalanceSums; balanceSheet: TrialBalanceSums };
  /** Profit of the period. */
  profit: number;
  pagination: TrialBalancePagination;
}

export type TrialBalanceExportType = 'pdf' | 'xlsx' | 'csv';
