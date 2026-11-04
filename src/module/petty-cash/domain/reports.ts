/** Read-only petty cash reports and the audit trail, in the shapes the backend answers. */

export const AGING_BUCKETS = ['0-7', '8-14', '15-30', '>30'] as const;
export type AgingBucket = (typeof AGING_BUCKETS)[number];

export interface PendingVoucherItem {
  id: string;
  fundCode: string;
  voucherNumber: string;
  transactionDate: string;
  beneficiary: string;
  totalAmount: number;
  ageDays: number;
  agingBucket: AgingBucket;
}

export interface PendingVouchersReport {
  asOf: string;
  summary: Record<AgingBucket, { count: number; amount: number }>;
  total: number;
  items: PendingVoucherItem[];
}

export type ExpenseGroup = 'account' | 'tag' | 'month';

export interface ExpenseSummaryReport {
  groupBy: ExpenseGroup;
  total: number;
  totalTax: number;
  items: Array<{
    key: string;
    label: string;
    amount: number;
    taxAmount: number;
    lineCount: number;
  }>;
}

export interface AdvanceUserRow {
  requesterId: string;
  requesterName: string;
  totalCount: number;
  totalAmount: number;
  outstandingCount: number;
  outstandingAmount: number;
  overdueCount: number;
  settledLateCount: number;
  receivableAmount: number;
  lastAdvanceAt: string | null;
  isBlocked: boolean;
}

export interface ReconciliationRow {
  fund: { id: string; code: string; name: string; accountNumber: string };
  pagu: number;
  glBalance: number;
  glDifference: number;
  cashBalance: number;
  cashBookBalance: number;
  cashBookDifference: number;
  isImprestBalanced: boolean;
  isOk: boolean;
}

export interface PeriodEndFund {
  fund: { id: string; code: string; name: string };
  vouchers: Array<{ id: string; voucherNumber: string; totalAmount: number }>;
  voucherTotal: number;
  advances: Array<{
    id: string;
    advanceNumber: string;
    requesterName: string;
    outstanding: number;
  }>;
  advanceTotal: number;
  suggestedAction: string;
}

export interface PeriodEndCheck {
  date: string;
  hasOpenItems: boolean;
  voucherTotal: number;
  advanceTotal: number;
  funds: PeriodEndFund[];
}

export const AUDIT_ENTITY_TYPES = [
  'FUND',
  'VOUCHER',
  'COUNT',
  'REIMBURSEMENT',
  'ADVANCE',
  'USER_RESTRICTION',
] as const;
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export interface AuditEntry {
  id: string;
  entityType: string;
  action: string;
  byName: string;
  reason: string | null;
  createdAt: string;
}

/** Actions the backend records; anything else is shown as a general update. */
export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'SUBMIT',
  'APPROVE',
  'REJECT',
  'VOID',
  'CANCEL',
  'DISBURSE',
  'REMOVE_ATTACHMENT',
  'SOD_OVERRIDE',
  'CONVERT_TO_RECEIVABLE',
  'CUSTODIAN_REJECT',
  'CUSTODIAN_VERIFY',
  'FINANCE_REJECT',
  'FINANCE_VERIFY',
  'SET_SETTLEMENT_ACCOUNTS',
  'SUBMIT_SETTLEMENT',
  'BLOCK',
  'UNBLOCK',
  'OVERRIDE_OVERDUE',
  'REMOVE_OVERRIDE',
  'PAGU_ADJUSTMENT',
  'CLOSE',
  'ADD_POCKET',
  'UPDATE_POCKET',
  'POCKET_TRANSFER',
  'APPROVE_FINANCE',
  'APPROVE_BM',
  'APPROVE_CF',
];

/** Actions seen per kind of document, for the action filter of the audit log. */
export const AUDIT_ACTIONS_BY_TYPE: Record<AuditEntityType, string[]> = {
  FUND: [
    'CREATE',
    'UPDATE',
    'SOD_OVERRIDE',
    'PAGU_ADJUSTMENT',
    'CLOSE',
    'ADD_POCKET',
    'UPDATE_POCKET',
    'POCKET_TRANSFER',
  ],
  VOUCHER: ['CREATE', 'UPDATE', 'SUBMIT', 'APPROVE', 'REJECT', 'VOID', 'REMOVE_ATTACHMENT'],
  COUNT: ['CREATE', 'SUBMIT', 'APPROVE_FINANCE', 'APPROVE_BM', 'APPROVE_CF', 'REJECT'],
  REIMBURSEMENT: [
    'SUBMIT',
    'APPROVE_FINANCE',
    'APPROVE_BM',
    'APPROVE_CF',
    'REJECT',
    'CANCEL',
    'DISBURSE',
  ],
  ADVANCE: [
    'CREATE',
    'APPROVE',
    'REJECT',
    'CANCEL',
    'DISBURSE',
    'SUBMIT_SETTLEMENT',
    'SET_SETTLEMENT_ACCOUNTS',
    'CUSTODIAN_VERIFY',
    'CUSTODIAN_REJECT',
    'FINANCE_VERIFY',
    'FINANCE_REJECT',
    'CONVERT_TO_RECEIVABLE',
  ],
  USER_RESTRICTION: ['BLOCK', 'UNBLOCK', 'OVERRIDE_OVERDUE', 'REMOVE_OVERRIDE'],
};
