export interface GetReconciliationModel {
  bankStatements: BankStatementData[];
  journalDetails: JournalDetail[];
}

export interface BankStatementData {
  id: string;
  date: string;
  description: string;
  amount: number;
  isReconciled: boolean;
  reference?: string;
  matchedJournalDetail?: JournalDetail;
  account?: {
    id: string;
    name: string;
  };
  recommendations?: Recommendation[];
}

export interface Recommendation {
  journalDetail: JournalDetail;
  fuzzyScore: number;
  dayDifference: number;
}

export interface JournalDetail {
  id: string;
  transactionDate: string;
  transactionNumber?: string;
  description?: string;
  credit: number;
  debit: number;
  isReconciled: boolean;
  transactionType?: string;
}
