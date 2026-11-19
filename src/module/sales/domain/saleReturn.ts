import type { AmountCount, SaleDocCustomer, SaleDocListParams } from './saleDocument';

export type ReturnStatus = 'DRAFT' | 'POSTED' | 'VOID';
/** What the badge shows: the server's own word for where a return stands. */
export type ReturnDisplayStatus = 'DRAFT' | 'ISSUED' | 'COMPLETED' | 'VOID';
export type ReturnSettlement = 'REDUCE_INVOICE' | 'CUSTOMER_CREDIT';

export const RETURN_TABS = ['draft', 'issued', 'completed', 'cancelled'] as const;
export type ReturnTab = (typeof RETURN_TABS)[number];

/** The reasons the API accepts, sent as written. */
export const RETURN_REASONS = [
  'Salah tagih',
  'Jasa tidak jadi dilaksanakan',
  'Komplain kualitas',
  'Barang dikembalikan',
  'Lainnya',
] as const;
export type ReturnReason = (typeof RETURN_REASONS)[number];

export interface ReturnLine {
  id: string;
  /** The invoice line this return line takes back (`items[]._id` of the invoice). */
  saleItem: string;
  product: { id: string; name: string } | null;
  description: string;
  quantity: number;
  amount: number;
  discountAmount: number;
  taxAmount: number;
  withholdingAmount: number;
}

export interface ReturnApplication {
  id: string;
  /** The invoice the credit paid. */
  sale: string | null;
  saleNumber: string;
  amount: number;
  appliedAt: string | null;
  voided: boolean;
}

export interface SaleReturn {
  id: string;
  transactionNumber: string;
  transactionDate: string | null;
  customer: SaleDocCustomer | null;
  /** Id of the invoice this return corrects. */
  sale: string | null;
  saleNumber: string;
  reason: string;
  settlement: ReturnSettlement;
  memo: string;
  items: ReturnLine[];
  amount: number;
  discountAmount: number;
  net: number;
  taxAmount: number;
  withholdingAmount: number;
  finalAmount: number;
  /** How much of the invoice's balance this return took off. */
  appliedToInvoice: number;
  creditUsed: number;
  creditRemaining: number;
  refundAmount: number;
  status: ReturnStatus;
  displayStatus: ReturnDisplayStatus;
  applications: ReturnApplication[];
  postedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ReturnSummary {
  thisMonth: AmountCount;
  /** Customer credit not yet used or refunded. */
  credit: AmountCount;
  /** Drafts waiting to be issued. */
  waiting: AmountCount;
  counts: Record<ReturnTab, number>;
}

export type ReturnListParams = SaleDocListParams<ReturnTab> & { sale?: string };

export interface ReturnActionSet {
  edit: boolean;
  /** "Terbitkan": posts the journal. */
  issue: boolean;
  remove: boolean;
  /** Cancels an issued return; refused while its credit is used or refunded. */
  cancel: boolean;
  cancelBlocked: boolean;
  applyCredit: boolean;
  refund: boolean;
  cancelRefund: boolean;
  /** An unused application can be taken back. */
  cancelApplication: boolean;
}

/**
 * What a return offers in its current state, from the sales API guide. The server decides and a
 * refusal is shown to the user; rights are applied separately.
 */
export const returnActions = (
  ret: Pick<
    SaleReturn,
    'status' | 'creditRemaining' | 'creditUsed' | 'refundAmount' | 'applications'
  >
): ReturnActionSet => {
  const draft = ret.status === 'DRAFT';
  const posted = ret.status === 'POSTED';
  const refunded = ret.refundAmount > 0;
  const hasCredit = ret.creditRemaining > 0;
  return {
    edit: draft,
    issue: draft,
    remove: draft,
    cancel: posted,
    cancelBlocked: posted && (ret.creditUsed > 0 || refunded),
    applyCredit: posted && hasCredit,
    refund: posted && hasCredit,
    cancelRefund: posted && refunded,
    cancelApplication: posted && ret.applications.some((application) => !application.voided),
  };
};

/** What the signed-in user may do with returns (`JP-SALES-RETURN`). */
export interface ReturnRights {
  create: boolean;
  update: boolean;
  delete: boolean;
}

export const allowedReturnActions = (
  actions: ReturnActionSet,
  rights: ReturnRights
): ReturnActionSet => ({
  edit: actions.edit && rights.update,
  issue: actions.issue && rights.update,
  remove: actions.remove && rights.delete,
  cancel: actions.cancel && rights.delete,
  cancelBlocked: actions.cancelBlocked,
  applyCredit: actions.applyCredit && rights.update,
  refund: actions.refund && rights.update,
  cancelRefund: actions.cancelRefund && rights.delete,
  cancelApplication: actions.cancelApplication && rights.delete,
});
