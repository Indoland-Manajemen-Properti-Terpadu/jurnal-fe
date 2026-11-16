export interface BankCashDetailItem {
  account: string;
  description: string;
  debit?: number;
  credit?: number;
}

/** The journal type the backend records for each posting form (`POST /v1/journal`). */
export type BankCashTransactionType = 'TRANSFER_MONEY' | 'RECEIVE_MONEY' | 'SEND_MONEY';

export interface BankCashTransactionPayload {
  transactionDate: string;
  transactionType: BankCashTransactionType;
  transactionNumber?: number;
  notes?: string;
  tags?: string[];
  transactionDetail: BankCashDetailItem[];
  /** Optional proof documents; present files make the request multipart. */
  attachments?: File[];
}
