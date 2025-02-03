// export interface GeneralLedgerReport {
//   categoryId: string;
//   name: string;
//   accounts: Account[];
// }

// export interface Account {
//   isBold: boolean;
//   name: string;
//   accountNumber: string;
//   beginningBalance: number;
//   changesDebit: number;
//   changesCredit: number;
//   endingBalance: number;
// }

export interface Transaction {
  isBold: boolean;
  transactionDate: Date | null;

  transactionName: string;
  debit: number;
  credit: number;
  total: number;
}

export interface GeneralLedgerReport {
  name: string;
  accountNumber: string;
  beginningBalance: Transaction;
  transactions: Transaction[];
  endingBalance: Transaction;
}

export interface Transaction {
  transactionDate: Date | null;
  transactionName: string;
  debit: number;
  credit: number;
  total: number;
}
