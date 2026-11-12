export interface EquityChangeReport {
  /** Decimal places the server rounded the amounts to; absent on an older server. */
  precision?: number;
  categoryId: string;
  name: string;
  accounts: Account[];
}

export interface Account {
  isBold: boolean;
  name: string;
  accountNumber: string;
  beginningBalance: number;
  changesDebit: number;
  changesCredit: number;
  endingBalance: number;
}
