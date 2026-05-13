export interface GetReconciliationModel {
  bankStatementData: BankStatementData[];
  journalTransaction: JournalTransaction[];
}

export interface BankStatementData {
  id: string;
  transactionDate: Date;
  transactionName: string;
  credit: number;
  debit: number;
  reconciled: boolean;
}

export interface JournalTransaction {
  id: string;
  transactionDate: Date;
  transactionNumber: number;
  credit: number;
  debit: number;
  reconciled?: boolean;
}
