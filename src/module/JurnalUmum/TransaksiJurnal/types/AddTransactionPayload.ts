interface TransactionDetail {
  account: string;
  description: string;
  debit: number;
  credit: number;
}

export type TransactionJournalPayload = {
  transactionNumber: number;
  transactionDate: string;
  transactionDetail: TransactionDetail[];
  notes: string;
  attachments: File[];
};
