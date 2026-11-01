export interface TrialBalanceReport {
  total: TotalBalance;
  data: Reports[];
}

export interface Reports {
  category: string;
  account: Account[];
  total_amount: number;
}

export interface Account {
  id: string;
  type: string;
  name: string;
  accountNumber: string;
  beginningBalance: BeginningBalance;
  changes: BeginningBalance;
  endingBalance: BeginningBalance;
}

export interface BeginningBalance {
  debit: number;
  credit: number;
}

export interface TotalBalance {
  totalDebitBeginningBalance: number;
  totalCreditBeginningBalance: number;
  totalDebitChanges: number;
  totalCreditChanges: number;
  totalDebitEndingBalance: number;
  totalCreditEndingBalance: number;
}
