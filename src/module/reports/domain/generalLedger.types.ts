export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

export type GeneralLedgerExportType = 'pdf' | 'xlsx' | 'csv';

export interface GeneralLedgerTransaction {
  transactionDate: string;
  transactionNumber: string;
  description: string;
  /** Longer memo of the journal, when it has one. */
  notes: string;
  debit: number;
  credit: number;
  balance: number;
  journalId: string;
}

export interface GeneralLedgerAccount {
  id: string;
  number: string;
  name: string;
  category: string;
  isContra: boolean;
  /** A parent account: its movement rolls up the movement of its sub accounts. */
  isHead: boolean;
  /** `debit` or `credit`; empty when the server does not say. */
  normalBalance: string;
  openingBalance: number;
  transactions: GeneralLedgerTransaction[];
  periodDebit: number;
  periodCredit: number;
  closingBalance: number;
}

export interface GeneralLedgerPagination {
  page: number;
  limit: number;
  totalAccounts: number;
  totalPages: number;
}

export interface GeneralLedgerReport {
  /** Decimal places the server rounded the amounts to; absent on an older server. */
  precision?: number;
  /** One page of accounts; the totals below cover every account of the period. */
  accounts: GeneralLedgerAccount[];
  pagination: GeneralLedgerPagination;
  periodDebitTotal: number;
  periodCreditTotal: number;
  periodLockName: string | null;
  periodLockType: string | null;
}
