export interface IncomeStatementReport {
  name: string;
  accounts: Account[];
}

export interface Account {
  name: string;
  accountNumber?: string;
  totalAmount: number;
  isBold?: boolean;
}

export interface DownloadReports {
  fromDate?: string;
  toDate?: string;
  type: 'pdf' | 'csv' | 'xlsx';
}
