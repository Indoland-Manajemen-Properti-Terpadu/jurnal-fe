import type {
  GoodsReceiptStatus,
  PaymentVoucherStatus,
  PurchaseBillStatus,
  PurchaseOrderStatus,
  PurchaseReturnStatus,
  GoodsReceiptDisplayStatus,
  OrderItemStatus,
} from '@/module/purchases/domain/purchaseDocuments';
import type { PaymentRequestStatus } from '@/module/purchases/domain/paymentRequest';
import type { PurchaseRequestStatus } from '@/module/purchases/domain/purchaseRequest';

/** Semantic status color shared by purchasing badges and document journey markers. */
export type StatusTone =
  | 'neutral'
  | 'info'
  | 'warning'
  | 'success'
  | 'danger'
  | 'cyan'
  | 'slate'
  | 'purple';

export type PurchaseStatus =
  | PurchaseRequestStatus
  | PurchaseOrderStatus
  | GoodsReceiptStatus
  | PurchaseBillStatus
  | PaymentVoucherStatus
  | PaymentRequestStatus
  | PurchaseReturnStatus
  | GoodsReceiptDisplayStatus
  | OrderItemStatus;

const TONES: Record<PurchaseStatus, StatusTone> = {
  DRAFT: 'neutral',
  PENDING_APPROVAL: 'warning',
  APPROVED: 'cyan',
  REJECTED: 'danger',
  SUBMITTED: 'warning',
  RETURNED: 'warning',
  IN_PROCUREMENT: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  SENT: 'info',
  WAITING_ADVANCE: 'warning',
  WAITING_RECEIPT: 'info',
  PARTIAL_RECEIVED: 'info',
  RECEIVED: 'cyan',
  CLOSED: 'slate',
  VOID: 'danger',
  POSTED: 'success',
  VERIFIED: 'warning',
  PARTIAL_PAID: 'warning',
  PAID: 'success',
  PROCESSED: 'warning',
  BILLED: 'success',
  UNBILLED: 'cyan',
  WAITING_BILL: 'info',
  BAPP_REJECTED: 'danger',
  WAITING_BAPP: 'info',
};

const LABEL_TONES: Record<string, StatusTone> = {
  'awaiting verification': 'warning',
  'menunggu verifikasi': 'warning',
  'awaiting procurement': 'warning',
  'menunggu pengadaan': 'warning',
  'waiting for approval': 'warning',
  'menunggu approval': 'warning',
  'waiting for advance': 'warning',
  'menunggu uang muka': 'warning',
  'waiting for pv': 'warning',
  'menunggu pv': 'warning',
  'waiting for a payment voucher': 'warning',
  'awaiting payment': 'warning',
  'menunggu pembayaran': 'warning',
  dikembalikan: 'warning',
  'sent back': 'warning',
  'advance invoice not recorded': 'warning',
  'faktur uang muka belum dicatat': 'warning',
  'advance unpaid': 'warning',
  'uang muka belum dibayar': 'warning',
  unpaid: 'warning',
  'belum dibayar': 'warning',
  'in procurement': 'info',
  'dalam pengadaan': 'info',
  'awaiting receipt': 'info',
  'menunggu penerimaan': 'info',
  'partially received': 'info',
  'diterima sebagian': 'info',
  'partially worked': 'info',
  'dikerjakan sebagian': 'info',
  'waiting for bill': 'info',
  'menunggu tagihan': 'info',
  'waiting for bapp': 'info',
  'menunggu bapp': 'info',
  approved: 'cyan',
  disetujui: 'cyan',
  'fully received': 'cyan',
  'diterima penuh': 'cyan',
  'work completed': 'cyan',
  'selesai dikerjakan': 'cyan',
  'fully billed': 'cyan',
  'ditagih penuh': 'cyan',
  'not billed yet': 'cyan',
  'belum difaktur': 'cyan',
  completed: 'success',
  selesai: 'success',
  billed: 'success',
  'sudah difaktur': 'success',
  lunas: 'success',
  paid: 'success',
  dibayar: 'success',
  'advance paid': 'success',
  'uang muka lunas': 'success',
  cancelled: 'danger',
  dibatalkan: 'danger',
  rejected: 'danger',
  ditolak: 'danger',
  'bapp rejected': 'danger',
  'bapp ditolak': 'danger',
  overdue: 'danger',
  'jatuh tempo': 'danger',
  closed: 'slate',
  ditutup: 'slate',
  draft: 'neutral',
  draf: 'neutral',
  'advance cancelled': 'neutral',
  'uang muka dibatalkan': 'neutral',
  'masa pemeliharaan': 'purple',
};

export const statusTone = (status: PurchaseStatus, label?: string): StatusTone =>
  (label ? LABEL_TONES[label.trim().toLowerCase()] : undefined) ?? TONES[status];

/** Statuses a list filters by, per document, in the order of the tabs and menus. */
export const REQUEST_STATUSES: PurchaseRequestStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'VERIFIED',
  'RETURNED',
  'IN_PROCUREMENT',
  'COMPLETED',
  'CANCELLED',
];
export const ORDER_STATUSES: PurchaseOrderStatus[] = [
  'DRAFT',
  'PENDING_APPROVAL',
  'REJECTED',
  'SENT',
  'PARTIAL_RECEIVED',
  'RECEIVED',
  'COMPLETED',
  'CLOSED',
  'VOID',
];
export const RECEIPT_STATUSES: GoodsReceiptDisplayStatus[] = [
  'UNBILLED',
  'BILLED',
  'PENDING_APPROVAL',
  'REJECTED',
  'VOID',
];
export const BILL_STATUSES: PurchaseBillStatus[] = [
  'DRAFT',
  'VERIFIED',
  'PARTIAL_PAID',
  'PAID',
  'VOID',
];
export const VOUCHER_STATUSES: PaymentVoucherStatus[] = ['DRAFT', 'PAID', 'VOID'];
export const RETURN_STATUSES: PurchaseReturnStatus[] = ['DRAFT', 'POSTED', 'VOID'];
