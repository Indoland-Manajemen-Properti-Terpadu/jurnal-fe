import type { JournalAccounts } from '@/module/chart-of-accounts';

/** One saved line of a draft: the account is either an id or an embedded account object. */
export interface DraftBalanceEntry {
  id?: string;
  _id?: string;
  accounts?: string | { id?: string; _id?: string };
  debit?: number | string;
  credit?: number | string;
}

export interface DraftBalance {
  id?: string;
  status?: boolean;
  period?: string | Date;
  isPublished?: boolean;
  publishedDate?: string | Date | null;
  accounts?: DraftBalanceEntry[];
}

/** An account row of the opening balance table: an account with both sides as numbers. */
export type OpeningAccountRow = JournalAccounts;

export type BalanceState = 'balanced' | 'empty' | 'unbalanced';
