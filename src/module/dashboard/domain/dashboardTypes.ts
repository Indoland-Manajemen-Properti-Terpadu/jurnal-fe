export type BalanceSheetLine = {
  accountId: string | null;
  accountNumber: string | null;
  accountName: string;
  categoryId: string;
  categoryName: string;
  balance: number;
};

export type BalanceSheetSummary = {
  endDate: string;
  currentAssets: BalanceSheetLine[];
  nonCurrentAssets: BalanceSheetLine[];
  liabilities: BalanceSheetLine[];
  equity: BalanceSheetLine[];
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalDepreciation: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
};

export type SaleSummary = {
  id: string;
  transactionNumber: string;
  customerName: string;
  transactionDate: string | null;
  dueDate: string | null;
  status: string;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
};

export type PeriodInfo = {
  id: string;
  name: string;
  type: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
};

export type AuditLogEntry = {
  id: string;
  action: string;
  transactionNumber: number | string | null;
  journalId: string | null;
  performedBy: string;
  createdAt: string | null;
};

export type MonthlyPoint = { key: string; label: string; invoiced: number; collected: number };

export type AgingBucket = {
  key: string;
  label: string;
  amount: number;
  count: number;
  color: string;
};
