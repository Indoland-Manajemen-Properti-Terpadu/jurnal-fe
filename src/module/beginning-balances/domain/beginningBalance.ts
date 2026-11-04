/** One account of `GET /v1/accounts/simple`: `type` is the side of its category, not yet flipped by `isContra`. */
export interface SimpleAccount {
  id: string;
  name: string;
  accountNumber: string;
  type: 'debit' | 'credit';
  isContra: boolean;
}

/** One saved line of the draft (`GET /v1/accounts/get/draft-start-amount`, `accounts`). */
export interface DraftBalanceEntry {
  _id?: string;
  id?: string;
  name?: string;
  accountNumber?: string;
  debit?: number | string;
  credit?: number | string;
}

export interface DraftBalance {
  id?: string;
  /** `false` when no draft exists yet. */
  status?: boolean;
  period?: string | Date;
  isPublished?: boolean;
  publishedDate?: string | Date | null;
  /** The opening balance date may not be after it; `null` when there is no regular journal yet. */
  firstTransactionDate?: string | Date | null;
  accounts?: DraftBalanceEntry[];
}

/** One line of the publish log (`GET /v1/accounts/get/draft-start-amount/logs`). */
export interface BalanceLog {
  action?: string;
  period?: string | Date;
  createdAt?: string;
  balances?: {
    account?: string | { id?: string; _id?: string };
    debit?: number | string;
    credit?: number | string;
  }[];
}

/** What the server holds as the opening balance: a period and the amount lines. */
export interface SavedBalance {
  period: string | Date | null;
  entries: DraftBalanceEntry[];
}

/** One row of the opening balance table. */
export interface OpeningRow {
  id: string;
  name: string;
  accountNumber: string;
  /** The side the account grows on, after the contra flip. */
  normalSide: 'debit' | 'credit';
  isContra: boolean;
  debit: number;
  credit: number;
}

/** Why a conversion date cannot be used, or null when it can. */
export type DateIssue = 'locked' | 'afterFirstTransaction' | null;

export type BalanceState = 'balanced' | 'empty' | 'unbalanced';

export interface OpeningFilter {
  query: string;
  /** First digit of the account code (1-8), or null for every class. */
  accountClass: number | null;
  onlyFilled: boolean;
}
