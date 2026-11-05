import type {
  ApprovalState,
  DocumentBase,
  PartyRef,
  PaymentMethodRef,
  ProductRef,
  TaxRef,
} from '@/module/purchases/domain/purchaseCommon';

export type ProcurementMode = 'DIRECT' | 'WITH_QUOTATION';
export type DiscountType = 'percentage' | 'nominal';
export type WithholdingType = 'percentage' | 'nominal';

export type PurchaseRequestStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'VENDOR_SELECTED'
  | 'CONVERTED'
  | 'CANCELLED';

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PARTIAL_RECEIVED'
  | 'RECEIVED'
  | 'CLOSED'
  | 'VOID';

export type GoodsReceiptStatus = 'POSTED' | 'VOID';
export type PurchaseBillStatus = 'DRAFT' | 'VERIFIED' | 'PARTIAL_PAID' | 'PAID' | 'VOID';
export type PaymentVoucherStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PAID'
  | 'REJECTED'
  | 'VOID';
export type PurchaseReturnStatus = 'DRAFT' | 'POSTED' | 'VOID';

export interface RequestItem {
  id: string;
  product: ProductRef | null;
  description: string;
  quantity: number;
  unitName: string | null;
}

export interface QuotationItem {
  requestItemId: string;
  quantity: number;
  unitPrice: number;
}

export interface Quotation {
  id: string;
  vendor: PartyRef;
  number: string;
  date: string;
  validUntil: string | null;
  items: QuotationItem[];
  total: number;
  notes: string;
}

export interface PurchaseRequest extends DocumentBase {
  requiredDate: string | null;
  department: string;
  purpose: string;
  mode: ProcurementMode;
  status: PurchaseRequestStatus;
  items: RequestItem[];
  quotations: Quotation[];
  selectedQuotationId: string | null;
  purchaseOrderId: string | null;
  approval: ApprovalState;
}

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
  quantity: number;
  unitName: string | null;
  unitPrice: number;
  tax: TaxRef | null;
  discountAmount: number;
  taxAmount: number;
  amount: number;
  receivedQty: number;
  billedQty: number;
}

export interface PurchaseOrder extends DocumentBase, DocumentAmounts {
  expectedDate: string | null;
  vendor: PartyRef;
  purchaseRequestId: string;
  paymentTermName: string | null;
  deliveryAddress: string;
  status: PurchaseOrderStatus;
  items: OrderItem[];
  approval: ApprovalState;
}

export interface ReceiptItem {
  id: string;
  purchaseOrderItemId: string;
  product: ProductRef | null;
  description: string;
  receivedQty: number;
  accrualAmount: number;
}

export interface GoodsReceipt extends DocumentBase {
  vendor: PartyRef;
  purchaseOrderId: string;
  deliveryNote: string;
  status: GoodsReceiptStatus;
  items: ReceiptItem[];
  journalId: string | null;
}

export type VarianceType = 'PRICE' | 'TOTAL';

export interface BillVariance {
  type: VarianceType;
  expected: number;
  actual: number;
}

export interface BillItem {
  id: string;
  purchaseOrderItemId: string;
  product: ProductRef | null;
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
  vendor: PartyRef;
  purchaseOrderId: string;
  vendorInvoiceNumber: string;
  vendorInvoiceTotal: number | null;
  dueDate: string | null;
  status: PurchaseBillStatus;
  items: BillItem[];
  paidAmount: number;
  returnedAmount: number;
  creditAppliedAmount: number;
  remainingAmount: number;
  variances: BillVariance[];
  creditApplications: CreditApplication[];
  journalId: string | null;
  verifiedAt: string | null;
}

export type PaymentVoucherType = 'BILL' | 'ADVANCE';

export interface PaymentLine {
  billId: string;
  amount: number;
}

export interface PaymentVoucher extends DocumentBase {
  type: PaymentVoucherType;
  vendor: PartyRef;
  status: PaymentVoucherStatus;
  lines: PaymentLine[];
  totalAmount: number;
  advanceAppliedAmount: number;
  purchaseOrderId: string | null;
  paymentMethod: PaymentMethodRef | null;
  adminFee: number;
  referenceNumber: string;
  journalId: string | null;
  paidAt: string | null;
  approval: ApprovalState;
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

export interface PurchaseReturn extends DocumentBase {
  vendor: PartyRef;
  billId: string;
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
  rows: PayablesAgingRow[];
  totals: Omit<PayablesAgingRow, 'vendorId' | 'vendorName'>;
}
