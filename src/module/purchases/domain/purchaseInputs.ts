import type {
  DiscountType,
  ProcurementMode,
  WithholdingType,
} from '@/module/purchases/domain/purchaseDocuments';

/** What a form submits. Dates are `YYYY-MM-DD`; optional fields are left out when empty. */

export interface RequestItemInput {
  product?: string;
  description: string;
  quantity: number;
}

export interface PurchaseRequestInput {
  transactionDate: string;
  requiredDate?: string;
  department?: string;
  purpose?: string;
  procurementMode: ProcurementMode;
  memo?: string;
  items: RequestItemInput[];
}

export interface QuotationInput {
  vendor: string;
  quotationNumber?: string;
  quotationDate: string;
  validUntil?: string;
  notes?: string;
  items: { requestItem: string; quantity: number; unitPrice: number }[];
}

export interface OrderItemInput {
  requestItem: string;
  unitPrice: number;
  tax?: string;
}

export interface OrderPricing {
  isPriceIncludeTax: boolean;
  discountType?: DiscountType;
  discountValue?: number;
  withholdingType?: WithholdingType;
  withholdingValue?: number;
  withholdingTaxCode?: string;
}

export interface PurchaseOrderInput extends OrderPricing {
  purchaseRequest: string;
  transactionDate: string;
  expectedDate?: string;
  /** Required for a direct request; a request with quotations takes the chosen vendor. */
  vendor?: string;
  paymentTerm?: string;
  deliveryAddress?: string;
  memo?: string;
  items: OrderItemInput[];
}

export interface GoodsReceiptInput {
  purchaseOrder: string;
  transactionDate: string;
  deliveryNote?: string;
  memo?: string;
  items: { purchaseOrderItem: string; receivedQty: number }[];
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
