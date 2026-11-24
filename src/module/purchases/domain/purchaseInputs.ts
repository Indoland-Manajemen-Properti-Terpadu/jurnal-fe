import type { BillItemInput } from '@/module/purchases/domain/billSources';
import type { RequestItemKind } from '@/module/purchases/domain/purchaseRequest';

/** What a form submits. Dates are `YYYY-MM-DD`; optional fields are left out when empty. */

export interface RequestItemInput {
  product?: string;
  kind: RequestItemKind;
  description: string;
  specification: string;
  quantity: number;
  unit?: string;
}

/** The body of a create or update. The service keeps what a PUT leaves out, so every field is sent. */
export interface PurchaseRequestInput {
  transactionDate: string;
  requiredDate: string;
  department: string;
  /** Needed when a line is goods; for services only it is left out and the service clears it. */
  deliveryWarehouseId?: string;
  purpose: string;
  iom: { number: string; date: string | null };
  memo: string;
  items: RequestItemInput[];
}

export interface GoodsReceiptInput {
  purchaseOrder: string;
  transactionDate: string;
  /** Required when more than one warehouse is active and the order has stocked goods. */
  warehouse?: string;
  deliveryNote?: string;
  memo?: string;
  items: { purchaseOrderItem: string; receivedQty: number; rejectedQty?: number }[];
  /** The signed BAPP (1 to 5 files); a service receipt is then sent as multipart. */
  attachments?: File[];
}

export type DiscountKind = 'percentage' | 'nominal';

/** The header a bill takes whatever its source; dates are `YYYY-MM-DD`. */
export interface BillHeaderInput {
  transactionDate: string;
  vendorInvoiceNumber?: string;
  taxInvoiceNumber?: string;
  vendorInvoiceTotal?: number;
  paymentTerm?: string;
  dueDate?: string;
  discountType?: DiscountKind;
  discountValue?: number;
  withholdingType?: DiscountKind;
  withholdingValue?: number;
  withholdingTaxCode?: string;
  /** Ids of transaction tags. */
  tags?: string[];
  memo?: string;
  /** Creates the bill already verified. */
  post?: boolean;
  /** Goes on verifying even though the vendor's prices differ from the order. */
  acknowledgeVariance?: boolean;
}

export interface ManualBillItemInput {
  product?: string;
  account?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax?: string;
}

export type PurchaseBillInput = BillHeaderInput &
  (
    | { source: 'RECEIPT'; goodsReceipts: string[] }
    | { source: 'ORDER'; purchaseOrders: string[] }
    | { source: 'RECEIPT' | 'ORDER'; items: BillItemInput[] }
    | { source: 'MANUAL'; vendor: string; items: ManualBillItemInput[] }
  );

/** A draft bill changes its header only; the lines follow the receipts or the order. A cleared field is sent empty or null. */
export interface BillUpdateInput {
  transactionDate?: string;
  vendorInvoiceNumber?: string;
  taxInvoiceNumber?: string;
  vendorInvoiceTotal?: number;
  dueDate?: string;
  discountType?: DiscountKind | null;
  discountValue?: number;
  withholdingType?: DiscountKind | null;
  withholdingValue?: number;
  withholdingTaxCode?: string;
  tags?: string[];
  memo?: string;
}

export interface PurchaseReturnInput {
  bill: string;
  transactionDate: string;
  reason: string;
  settlement: 'DEDUCT' | 'CREDIT' | 'REFUND';
  warehouse?: string;
  memo?: string;
  items: { billItem: string; quantity: number }[];
}

export interface CreditApplicationInput {
  source: 'ADVANCE' | 'RETURN';
  sourceId: string;
  amount: number;
  transactionDate: string;
}

/** What can change on a draft PO / SPK; a field sent as null or empty is cleared. */
export interface OrderDraftInput {
  transactionDate: string;
  expectedDate: string | null;
  warehouse?: string | null;
  deliveryAddress: string;
  memo: string;
}

/** Marking an order as sent, with or without an email to the vendor. */
export type SendOrderInput =
  | { sendEmail: false; note?: string }
  | { sendEmail: true; to?: string; cc?: string[]; note?: string };
