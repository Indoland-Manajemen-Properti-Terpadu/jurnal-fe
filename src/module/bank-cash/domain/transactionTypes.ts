export interface BankCashDetailItem {
  account: string;
  description: string;
  debit?: number;
  credit?: number;
}

export interface BankCashTransactionPayload {
  transactionDate: string;
  transactionNumber?: number;
  notes?: string;
  tags?: string[];
  transactionDetail: BankCashDetailItem[];
  /** Optional proof documents; present files make the request multipart. */
  attachments?: File[];
}
