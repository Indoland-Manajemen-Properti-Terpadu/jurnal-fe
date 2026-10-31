export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

export type GeneralLedgerExportType = 'pdf' | 'xlsx' | 'csv';

export interface GeneralLedgerTransaction {
  transactionDate: string;
  transactionNumber: string;
  description: string;
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
  openingBalance: number;
  transactions: GeneralLedgerTransaction[];
  periodDebit: number;
  periodCredit: number;
  closingBalance: number;
}

export interface GeneralLedgerReport {
  accounts: GeneralLedgerAccount[];
  periodDebitTotal: number;
  periodCreditTotal: number;
  periodLockName: string | null;
  periodLockType: string | null;
}

