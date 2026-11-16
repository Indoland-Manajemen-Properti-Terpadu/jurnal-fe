/**
 * An accounting period held by the server. Two kinds share one list:
 * - `LOCK` only locks transaction dates; its dates, status and name can change and it can be deleted.
 * - `CLOSE` (closing the books) locks the dates and posts a closing journal that moves revenue and
 *   expense balances to retained earnings. Afterwards only its name and notes change; it is undone
 *   only by reopening the latest one.
 */
export type PeriodType = 'LOCK' | 'CLOSE';

export const PERIOD_TYPES: readonly PeriodType[] = ['LOCK', 'CLOSE'];

export interface PeriodUser {
  id: string;
  name: string;
}

export interface AccountingPeriod {
  id: string;
  name: string;
  type: PeriodType;
  /** Calendar day `YYYY-MM-DD`; never shifted to a time zone. */
  startDate: string;
  /** Calendar day `YYYY-MM-DD`, inclusive. */
  endDate: string;
  isActive: boolean;
  notes: string;
  createdBy: PeriodUser | null;
  /** Journal posted by a closing; empty when no revenue or expense account had a balance. */
  closingJournalId: string | null;
  /** When a closing was reopened; the period then stays in the list, inactive. */
  reopenedAt: string | null;
  /** Who reopened it; the list sends only an id, so the name may be missing. */
  reopenedBy: PeriodUser | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PeriodPagination {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

export interface PeriodPage {
  items: AccountingPeriod[];
  pagination: PeriodPagination;
}

export type PeriodStatusFilter = 'active' | 'inactive';

export interface PeriodListParams {
  type?: PeriodType;
  status?: PeriodStatusFilter;
  page: number;
  limit: number;
  sortBy?: string;
}

/** Body of a new period. */
export interface PeriodCreateValues {
  name: string;
  type: PeriodType;
  startDate: string;
  endDate: string;
  notes: string;
}

/** Fields a change may carry; a closing only accepts `name` and `notes`. */
export interface PeriodUpdateValues {
  name: string;
  notes: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface DateLockCheck {
  isLocked: boolean;
  period: AccountingPeriod | null;
}
