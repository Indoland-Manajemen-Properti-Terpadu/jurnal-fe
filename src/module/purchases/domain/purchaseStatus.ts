import type {
  GoodsReceiptStatus,
  PaymentVoucherStatus,
  PurchaseBillStatus,
  PurchaseOrderStatus,
  PurchaseRequestStatus,
  PurchaseReturnStatus,
} from '@/module/purchases/domain/purchaseDocuments';

/** Tone drives the badge color: color only carries real success, warning and failure. */
export type StatusTone = 'neutral' | 'info' | 'warning' | 'success' | 'danger';

export type PurchaseStatus =
  | PurchaseRequestStatus
  | PurchaseOrderStatus
  | GoodsReceiptStatus
  | PurchaseBillStatus
  | PaymentVoucherStatus
  | PurchaseReturnStatus;

const TONES: Record<PurchaseStatus, StatusTone> = {
  DRAFT: 'neutral',
  PENDING_APPROVAL: 'warning',
  APPROVED: 'info',
  REJECTED: 'danger',
  VENDOR_SELECTED: 'info',
  CONVERTED: 'success',
  CANCELLED: 'neutral',
  PARTIAL_RECEIVED: 'info',
  RECEIVED: 'success',
  CLOSED: 'neutral',
  VOID: 'neutral',
  POSTED: 'success',
  VERIFIED: 'info',
  PARTIAL_PAID: 'warning',
  PAID: 'success',
};

export const statusTone = (status: PurchaseStatus): StatusTone => TONES[status];

/** Statuses a list filters by, per document, in the order of the tabs and menus. */
export const REQUEST_STATUSES: PurchaseRequestStatus[] = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'VENDOR_SELECTED',
  'CONVERTED',
  'CANCELLED',
];
export const ORDER_STATUSES: PurchaseOrderStatus[] = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'PARTIAL_RECEIVED',
  'RECEIVED',
  'CLOSED',
  'VOID',
];
export const RECEIPT_STATUSES: GoodsReceiptStatus[] = ['POSTED', 'VOID'];
export const BILL_STATUSES: PurchaseBillStatus[] = [
  'DRAFT',
  'VERIFIED',
  'PARTIAL_PAID',
  'PAID',
  'VOID',
];
export const VOUCHER_STATUSES: PaymentVoucherStatus[] = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'PAID',
  'REJECTED',
  'VOID',
];
export const RETURN_STATUSES: PurchaseReturnStatus[] = ['DRAFT', 'POSTED', 'VOID'];
