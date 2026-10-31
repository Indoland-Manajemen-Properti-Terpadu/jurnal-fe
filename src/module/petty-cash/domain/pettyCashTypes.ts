export type FundStatus = 'ACTIVE' | 'LOW_BALANCE' | 'FROZEN';

export type VoucherStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'PAID'
  | 'PENDING_REIMBURSE'
  | 'REIMBURSEMENT_PENDING'
  | 'REIMBURSED'
  | 'REJECTED'
  | 'VOID';

export type ReimbursementStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'DISBURSED' | 'REJECTED';

export type CashCountStatus = 'BALANCED' | 'SHORT' | 'OVER';

export interface ExpenseAccountOption {
  id: string;
  code: string;
  name: string;
  category: string;
}

export interface PettyCashFund {
  id: string;
  name: string;
  code: string;
  pagu: number; // Plafond / Fixed Ceiling in Imprest System
  currentBalance: number; // Remaining Physical Cash in Hand
  pendingReimburseAmount: number; // Total spent in active unreimbursed vouchers
  custodianName: string;
  custodianRole: string;
  custodianAvatar?: string;
  minThresholdAlert: number; // Alert threshold e.g. 20%
  bankSourceAccount: {
    id: string;
    name: string;
    accountNumber: string;
  };
  status: FundStatus;
  description: string;
  lastOpnameDate: string;
  createdAt: string;
}

export interface PettyCashVoucher {
  id: string;
  fundId: string;
  fundName: string;
  voucherNumber: string; // e.g. PCV/202610/0042
  date: string;
  beneficiary: string;
  expenseAccount: ExpenseAccountOption;
  amount: number;
  description: string;
  receiptNumber: string;
  attachmentName?: string;
  status: VoucherStatus;
  reimbursementId?: string;
  reimbursementNumber?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  createdBy: string;
}

export interface PettyCashReimbursement {
  id: string;
  fundId: string;
  fundName: string;
  reimbursementNumber: string; // e.g. PCR/202610/0012
  date: string;
  totalAmount: number;
  voucherCount: number;
  voucherIds: string[];
  bankAccountId: string;
  bankAccountName: string;
  bankAccountNumber: string;
  status: ReimbursementStatus;
  notes?: string;
  requestedBy: string;
  approvedBy?: string;
  disbursedAt?: string;
  journalEntryNumber?: string;
  expenseBreakdown: Array<{
    accountCode: string;
    accountName: string;
    amount: number;
  }>;
}

export interface CashDenomination {
  value: number;
  label: string;
  count: number;
  subtotal: number;
}

export interface PettyCashCount {
  id: string;
  fundId: string;
  fundName: string;
  countNumber: string; // e.g. BAO/202610/0005 (Berita Acara Opname)
  date: string;
  countedBy: string;
  witnessBy: string;
  denominations: Array<{
    value: number;
    label: string;
    count: number;
    subtotal: number;
  }>;
  totalPhysicalCash: number;
  totalUnreimbursedVouchers: number;
  actualTotal: number; // totalPhysicalCash + totalUnreimbursedVouchers
  pagu: number;
  variance: number; // actualTotal - pagu
  status: CashCountStatus;
  notes?: string;
}
