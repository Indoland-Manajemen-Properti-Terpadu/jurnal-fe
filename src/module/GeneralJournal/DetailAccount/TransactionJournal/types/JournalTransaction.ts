interface JournalTransactionTable {
  id: number;
  transaction: string;
  date: string;
  received: number;
  sent: number;
  balance: number;
  status?: string;
  description?: string;
}
