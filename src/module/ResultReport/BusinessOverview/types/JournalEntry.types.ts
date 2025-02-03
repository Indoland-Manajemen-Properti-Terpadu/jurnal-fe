export interface TableJournalEntryProps {
  id?: number;
  transactionName?: string;
  transactionDate?: Date;
  transaction?: Transaction[];
}

export interface Transaction {
  id?: number;
  accountName?: string;
  accountCode?: number;
  debit?: number;
  credit?: number;
}

export interface ReportJournalEntryModel {
  id: string;
  transactionNumber: number;
  transactionDate: Date;
  transactionDetail: TransactionDetail[];
}

export interface TransactionDetail {
  id: string;
  account?: Account;
  description: string;
  debit?: number;
  credit?: number;
}

export interface Account {
  id: string;
  isLocked: boolean;
  name: string;
  accountNumber: string;
  category: Category;
  subAccount: any[];
  amount: number;
  debit: number;
  credit: number;
  isAllUser: boolean;
  isBankAndCash: boolean;
  level: string;
  reconciliationDetail: any[];
  journals: any[];
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  categoryID: string;
  name: string;
  isDebit: boolean;
}
