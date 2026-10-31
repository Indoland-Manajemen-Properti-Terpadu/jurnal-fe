export interface EquityChangeReport {
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
