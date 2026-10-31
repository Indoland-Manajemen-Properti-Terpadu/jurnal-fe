/** Raw API shapes. Every field is optional because the mapper defaults what is missing. */
export type ApiEnvelope<T> = { code: number; message: string; data: T };

export type BalanceSheetLineDto = {
  accountId?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  balance?: unknown;
};

export type BalanceSheetDto = {
  endDate?: string;
  assets?: {
    currentAssets?: unknown;
    nonCurrentAssets?: unknown;
    totalCurrentAssets?: unknown;
    totalNonCurrentAssets?: unknown;
    totalDepreciationAmortization?: unknown;
  };
  liabilities?: unknown;
  equity?: unknown;
  totalAssets?: unknown;
  totalLiabilities?: unknown;
  totalEquity?: unknown;
};

export type SaleDto = {
  id?: string;
  _id?: string;
  transactionNumber?: string;
  customer?: { displayName?: string };
  transactionDate?: string | null;
  dueDate?: string | null;
  status?: string;
  finalAmount?: unknown;
  subtotal?: unknown;
  discountAmount?: unknown;
  total?: unknown;
  paidAmount?: unknown;
  remainingAmount?: unknown;
};

export type SalesPageDto = { data?: unknown; pagination?: { total?: unknown } };

export type PeriodDto = {
  id?: string;
  name?: string;
  type?: string;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: unknown;
};

export type AuditLogDto = {
  id?: string;
  action?: string;
  journal?: { id?: string; transactionNumber?: number | string };
  snapshot?: { transactionNumber?: number | string };
  performedBy?: { name?: string };
  createdAt?: string | null;
};
