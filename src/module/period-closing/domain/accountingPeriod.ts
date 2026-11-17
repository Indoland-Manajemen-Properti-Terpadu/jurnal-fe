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

/**
 * The server's own label of a period; `isActive` alone is not enough because a deleted period can
 * keep `isActive: true` (it only records the state before the delete).
 */
export type PeriodStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED' | 'REOPENED';

export type PeriodActivityAction =
  | 'CREATE'
  | 'UPDATE'
  | 'ACTIVATE'
  | 'DEACTIVATE'
  | 'DELETE'
  | 'CLOSE'
  | 'REOPEN'
  | 'OTHER';

export interface PeriodChange {
  field: string;
  /** Text of the stored value (a date is cut to its calendar day). */
  from: string;
  /** Text of the value the user sent. */
  to: string;
}

export interface PeriodActivity {
  action: PeriodActivityAction;
  performedBy: PeriodUser | null;
  performedAt: string | null;
  changes: PeriodChange[];
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
  status: PeriodStatus;
  notes: string;
  createdBy: PeriodUser | null;
  /** Journal posted by a closing; empty when no revenue or expense account had a balance. */
  closingJournalId: string | null;
  /** When a closing was reopened; the period then stays in the list, inactive. */
  reopenedAt: string | null;
  /** Who reopened it; the list sends only an id, so the name may be missing. */
  reopenedBy: PeriodUser | null;
  deactivatedAt: string | null;
  deactivatedBy: PeriodUser | null;
  deletedAt: string | null;
  deletedBy: PeriodUser | null;
  /** The log of the period, oldest first. */
  activities: PeriodActivity[];
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

export type PeriodStatusFilter = 'active' | 'inactive' | 'deleted';

export interface PeriodListParams {
  type?: PeriodType;
  status?: PeriodStatusFilter;
  page: number;
  limit: number;
  sortBy?: string;
  /** Also list deleted periods (the history table does; the summary and overlap checks do not). */
  includeDeleted?: boolean;
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
