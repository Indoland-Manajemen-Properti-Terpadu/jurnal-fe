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
}

export interface PurchaseBillInput {
  purchaseOrder: string;
  transactionDate: string;
  vendorInvoiceNumber?: string;
  vendorInvoiceTotal?: number;
  dueDate?: string;
  paymentTerm?: string;
  memo?: string;
  /** Left out, the whole received and not yet billed quantity is billed. */
  items?: { purchaseOrderItem: string; quantity: number; unitPrice?: number; tax?: string }[];
}

export interface PaymentVoucherInput {
  type?: 'ADVANCE';
  transactionDate: string;
  vendor: string;
  paymentMethod?: string;
  referenceNumber?: string;
  memo?: string;
  /** Bill vouchers only. */
  items?: { bill: string; amount: number }[];
  /** Advance vouchers only. */
  amount?: number;
  purchaseOrder?: string;
}

export interface PurchaseReturnInput {
  bill: string;
  transactionDate: string;
  reason: string;
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
