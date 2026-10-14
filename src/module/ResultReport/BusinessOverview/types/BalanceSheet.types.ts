export interface BalanceSheetReport {
  total: Total;
  account: Reports[];
}
export interface Reports {
  name: string;
  accounts: Account[];
}

export interface Account {
  name: string;
  accountNumber?: string;
  totalAmount: number;
  isBold?: boolean;
}

export interface Total {
  totalAssets: number;
  totalCurrentLiabilities: number;
  totalOwe: number;
  totalLiabilitiesAndOwe: number;
}
