import type { DocumentJournal } from '@/module/purchases/domain/documentJournal';
import type {
  ApprovalState,
  DocumentBase,
  NamedRef,
  PartyRef,
  PaymentMethodRef,
  ProductRef,
  TaxRef,
} from '@/module/purchases/domain/purchaseCommon';

export type DiscountType = 'percentage' | 'nominal';
export type WithholdingType = 'percentage' | 'nominal';

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'SENT'
  | 'WAITING_ADVANCE'
  | 'WAITING_RECEIPT'
  | 'WAITING_BILL'
  | 'PARTIAL_RECEIVED'
  | 'RECEIVED'
  | 'COMPLETED'
  | 'CLOSED'
  | 'PENDING_APPROVAL'
  | 'REJECTED'
  | 'VOID';

export type OrderItemStatus =
  | 'BILLED'
  | 'UNBILLED'
  | 'WAITING_BILL'
  | 'PENDING_APPROVAL'
  | 'BAPP_REJECTED'
  | 'WAITING_BAPP';

/** How a line of a PO / SPK is billed: all at once, as an advance, by term, by period or as retention. */
export type OrderScheduleKind = 'FULL' | 'ADVANCE' | 'TERM' | 'PERIOD' | 'RETENTION';

export interface OrderSchedule {
  kind: OrderScheduleKind;
  /** 1-based position among the lines of its kind, e.g. term 2 of 3. */
  seq: number;
  of: number;
  periodFrom: string | null;
  periodTo: string | null;
}

export type GoodsReceiptStatus = 'POSTED' | 'PENDING_APPROVAL' | 'REJECTED' | 'VOID';
export type GoodsReceiptDisplayStatus =
  | 'UNBILLED'
  | 'BILLED'
  | 'PENDING_APPROVAL'
  | 'REJECTED'
  | 'VOID';

/** Goods go through an FPB and post at once; services go through a BAPP that needs approval. */
export type ReceiptKind = 'GOODS' | 'SERVICE';
export type PurchaseBillStatus = 'DRAFT' | 'VERIFIED' | 'PARTIAL_PAID' | 'PAID' | 'VOID';

/** Where a bill comes from: receipts (FPB / BAPP), an order that takes no receipt, or typed in. */
export type BillSource = 'RECEIPT' | 'ORDER' | 'MANUAL';

/** The tabs of the list: not yet verified, owed, owed and late, paid, voided. */
export type BillDisplayStatus = 'DRAFT' | 'UNPAID' | 'OVERDUE' | 'PAID' | 'VOID';
/** A voucher has no approval of its own: the Payment Request it pays was approved already. */
export type PaymentVoucherStatus = 'DRAFT' | 'PAID' | 'VOID';
export type PurchaseReturnStatus = 'DRAFT' | 'POSTED' | 'VOID';

/** The money block shared by orders and bills; amounts come from the server. */
export interface DocumentAmounts {
  subtotal: number;
  discountType: DiscountType | null;
  discountValue: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  withholdingType: WithholdingType | null;
  withholdingValue: number;
  withholdingAmount: number;
  withholdingTaxCode: string | null;
  /** What is owed to the vendor: total minus withholding. */
  finalAmount: number;
  isPriceIncludeTax: boolean;
}

export interface OrderItem {
  id: string;
  requestItemId: string;
  product: ProductRef | null;
  description: string;
  specification: string;
  quantity: number;
  unitName: string | null;
  unitPrice: number;
  tax: TaxRef | null;
  discountAmount: number;
  taxAmount: number;
  amount: number;
  receivedQty: number;
  billedQty: number;
  /** Present on SPK lines; supplied by the service from BAPP and billing progress. */
  status?: OrderItemStatus;
  statusLabel?: string;
  schedule: OrderSchedule;
  /** A line that is only billed (shipping, advance, retention): nothing is received for it. */
  billOnly: boolean;
  reorderSelectable?: boolean;
  previousUnitPrice?: number | null;
}

/** How the advance is paid: through a bill of its own, or only through a Payment Request. */
export type OrderAdvanceMode = 'BILL' | 'REQUEST';

export interface AdvanceDocRef {
  id: string;
  number: string;
  status: string;
}

/** Where the advance (DP) of an order stands: its documents, its step and what is still held. */
export interface OrderAdvanceState {
  mode: OrderAdvanceMode;
  amount: number;
  paidAmount: number;
  billed: boolean;
  paid: boolean;
  /** Booked as advance, how much of it goods or services received have used, and what is left. */
  postedAmount: number;
  recognizedAmount: number;
  heldAmount: number;
  step: string;
  stepLabel: string;
  canCreateBill: boolean;
  /** False while the advance invoice is unpaid: a receipt is refused until then. */
  receiptAllowed: boolean;
  receiptBlockReason: string | null;
  bills: AdvanceDocRef[];
  paymentRequests: AdvanceDocRef[];
  paymentVouchers: AdvanceDocRef[];
}

export interface OrderAdvance {
  /** The advance agreed in the quote. */
  amount: number;
  /** Asked for in Payment Requests. */
  requested: number;
  paid: number;
  used: number;
  /** What a Payment Request can still ask for. */
  available: number;
}

/** What the term bills of an order hold back until the final handover; null when it holds none. */
export interface OrderRetention {
  percent: number;
  maintenanceMonths: number;
  total: number;
  held: number;
  released: number;
  balance: number;
  /** `HELD`, `RELEASABLE`, `RELEASED` or `NONE`. */
  state: string;
  /** Null until the last term is billed: the maintenance period only starts then. */
  maintenanceFrom: string | null;
  releasableFrom: string | null;
}

export interface PurchaseOrder extends DocumentBase, DocumentAmounts {
  /** The server's Indonesian label of the status. */
  statusLabel: string;
  /** `PO` for goods, `SPK` when every line is a service. */
  documentLabel: string;
  isService: boolean;
  expectedDate: string | null;
  vendor: PartyRef;
  vendorEmails: string[];
  purchaseRequestId: string;
  purchaseRequestNumber: string;
  purchaseRequestPurpose: string;
  paymentTermName: string | null;
  warranty: string;
  warehouse: NamedRef | null;
  deliveryAddress: string;
  status: PurchaseOrderStatus;
  /** Goods and services are received (FPB / BAPP) before billing; false bills straight from the order. */
  withReceipt: boolean;
  items: OrderItem[];
  advance: OrderAdvance;
  /** Null when the order has no advance. */
  advanceState: OrderAdvanceState | null;
  retention: OrderRetention | null;
  /** What the vendor is owed on this order, and how much of it is billed. */
  payableAmount: number;
  billedAmount: number;
  sent: { byEmail: boolean; to: string; cc: string[]; note: string };
  canReorder: boolean;
  reorderBlockReason: string | null;
  reorderSourceRef: { id: string; number: string } | null;
  reorderedOrders: { id: string; number: string; status: string }[];
  reorder: {
    note: string;
    sourceTotal: number;
    priceIncreased: boolean;
    totalIncreased: boolean;
  } | null;
  approvalPlan: { name: string; mode: 'ANY' | 'ALL'; roles: { role: string; name: string }[] }[];
  pendingApprovers: {
    level: number;
    name: string;
    mode: 'ANY' | 'ALL';
    roles: { id: string; name: string; approved: boolean }[];
  }[];
  canDecide: boolean;
  approvalStage: number | null;
  rejectionReason: string | null;
}

export interface ReceiptItem {
  id: string;
  purchaseOrderItemId: string;
  product: ProductRef | null;
  description: string;
  receivedQty: number;
  /** Goods turned away at delivery; they are not counted as received. */
  rejectedQty: number;
  accrualAmount: number;
}

export interface DocumentRef {
  id: string;
  number: string;
  status: string;
}

export interface GoodsReceipt extends DocumentBase {
  /** The journals this document posted; empty before it posts one. */
  journals: DocumentJournal[];
  kind: ReceiptKind;
  /** `FPB` for goods, `BAPP` for services. */
  documentLabel: string;
  statusLabel: string;
  vendor: PartyRef;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  warehouse: NamedRef | null;
  deliveryNote: string;
  status: GoodsReceiptStatus;
  /** Display state from the service; POSTED is split into billed and unbilled. */
  displayStatus: GoodsReceiptDisplayStatus;
  items: ReceiptItem[];
  /** What the receipt recognises as accrued before the bill. */
  amount: number;
  journalId: string | null;
  /** The bills made from this receipt. */
  billRefs: DocumentRef[];
  approval: ApprovalState;
}

export type VarianceType = 'PRICE' | 'TOTAL';

export interface BillVariance {
  type: VarianceType;
  expected: number;
  actual: number;
}

export interface BillItem {
  id: string;
  /** Empty on a manual bill, which is not tied to an order. */
  purchaseOrderItemId: string;
  product: ProductRef | null;
  account: NamedRef | null;
  description: string;
  quantity: number;
  unitName: string | null;
  unitPrice: number;
  tax: TaxRef | null;
  discountAmount: number;
  taxAmount: number;
  amount: number;
  returnedQty: number;
}

export interface CreditApplication {
  id: string;
  source: 'ADVANCE' | 'RETURN';
  sourceId: string;
  sourceNumber: string;
  amount: number;
  date: string;
  status: 'ACTIVE' | 'VOID';
}

export interface PurchaseBill extends DocumentBase, DocumentAmounts {
  journals: DocumentJournal[];
  source: BillSource;
  /** True for a manual bill: no order or receipt to compare it with. */
  noMatch: boolean;
  /** `RETENTION_RELEASE` for a bill that pays out held retention. */
  kind: 'BILL' | 'RETENTION_RELEASE';
  /** The final handover number a retention release was made against; empty for other bills. */
  bastNumber: string;
  statusLabel: string;
  displayStatus: BillDisplayStatus;
  displayStatusLabel: string;
  vendor: PartyRef;
  /** The first order the bill comes from; a bill can combine receipts of several orders. */
  purchaseOrderId: string;
  vendorInvoiceNumber: string;
  taxInvoiceNumber: string;
  vendorInvoiceTotal: number | null;
  dueDate: string | null;
  paymentTermName: string | null;
  status: PurchaseBillStatus;
  items: BillItem[];
  tags: string[];
  paidAmount: number;
  returnedAmount: number;
  creditAppliedAmount: number;
  remainingAmount: number;
  /** Inside a Payment Request that is not paid yet. */
  heldAmount: number;
  /** What a Payment Request can still ask for. */
  requestableAmount: number;
  goodsReceiptRefs: DocumentRef[];
  purchaseOrderRefs: DocumentRef[];
  paymentRequestRefs: DocumentRef[];
  returnRefs: DocumentRef[];
  variances: BillVariance[];
  creditApplications: CreditApplication[];
  journalId: string | null;
  verifiedAt: string | null;
}

/** What one voucher line pays: a Payment Request, which is for a bill (settlement) or an order (advance). */
export interface PaymentVoucherItem {
  requestId: string;
  requestNumber: string;
  kind: 'DP' | 'SETTLEMENT';
  amount: number;
  billId: string | null;
  billNumber: string | null;
  vendorInvoiceNumber: string;
  orderId: string | null;
  orderNumber: string | null;
}

export interface PaymentVoucher extends DocumentBase {
  journals: DocumentJournal[];
  /** The server's Indonesian label of the status. */
  statusLabel: string;
  vendor: PartyRef;
  status: PaymentVoucherStatus;
  items: PaymentVoucherItem[];
  totalAmount: number;
  paymentMethod: PaymentMethodRef | null;
  depositAccountId: string | null;
  adminFee: number;
  referenceNumber: string;
  journalId: string | null;
  paidAt: string | null;
  voidReason: string | null;
}

export interface ReturnItem {
  id: string;
  billItemId: string;
  product: ProductRef | null;
  description: string;
  quantity: number;
  amount: number;
  discountAmount: number;
  taxAmount: number;
}

/** What happens to the value of a posted return: cut from the bill, kept as vendor credit, or paid back. */
export type ReturnSettlement = 'DEDUCT' | 'CREDIT' | 'REFUND';

export interface PurchaseReturn extends DocumentBase {
  /** The server's Indonesian labels. */
  statusLabel: string;
  settlementLabel: string;
  settlement: ReturnSettlement;
  warehouse: NamedRef | null;
  vendor: PartyRef;
  billId: string;
  billNumber: string;
  reason: string;
  status: PurchaseReturnStatus;
  items: ReturnItem[];
  amount: number;
  discountAmount: number;
  net: number;
  taxAmount: number;
  withholdingAmount: number;
  finalAmount: number;
  /** Part that reduced the bill's balance; the rest became vendor credit. */
  appliedToBill: number;
  creditUsed: number;
  creditRemaining: number;
  /** Paid back in cash so far (settlement REFUND). */
  refundAmount: number;
  journalId: string | null;
}

export interface VendorCreditLine {
  id: string;
  source: 'ADVANCE' | 'RETURN';
  number: string;
  date: string;
  amount: number;
  available: number;
}

export interface VendorCredits {
  lines: VendorCreditLine[];
  total: number;
}

export interface PayablesAgingRow {
  vendorId: string;
  vendorName: string;
  billCount: number;
  totalRemaining: number;
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  over90: number;
}

export interface PayablesAging {
  asOf: string;
  precision?: number;
  rows: PayablesAgingRow[];
  totals: Omit<PayablesAgingRow, 'vendorId' | 'vendorName'>;
  invoices?: PayableInvoice[];
}

export interface PayableInvoice {
  id: string;
  transactionNumber: string;
  vendorInvoiceNumber: string;
  vendorName: string;
  dueDate: string;
  daysOverdue: number;
  agingBucket: string;
  remainingAmount: number;
}
