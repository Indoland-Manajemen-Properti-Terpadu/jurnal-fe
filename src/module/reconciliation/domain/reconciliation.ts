/** One line of a journal transaction, as the match endpoints know it. */
export interface TransactionLine {
  id: string;
  /** Account id of the line. */
  account: string;
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
  account?: { name?: string; accountNumber?: string };
  /** Present when the row is a whole transaction: the id to send is the line of the open account. */
  transactionDetail?: TransactionLine[];
}

export interface Recommendation {
  journalDetail: JournalDetail;
  fuzzyScore: number;
  dayDifference: number;
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

export interface GetReconciliationModel {
  /** Only the statements that are not reconciled yet; a matched one leaves this list. */
  bankStatements: BankStatementData[];
  /** Journal lines of the account that no bank statement row has matched. */
  unreconciledJournalDetails?: JournalDetail[];
  /** Net of the unreconciled statements, not the bank balance. */
  balance?: number;
}

export interface MatchPayload {
  matches: {
    bankStatementId: string;
    journalDetailIds: string[];
  }[];
}

/** A bank statement row with the journal rows shown next to it. */
export interface ReconciliationRow {
  bankStatement: BankStatementData;
  journalTransactions: JournalDetail[];
  isRecommendation: boolean;
  /** Days between the statement and its top suggestion. */
  dayDifference?: number;
}
