export type PurchaseStatus = 'DRAFT' | 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface PurchaseItemLine {
  id: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  total: number;
}

export interface PurchaseBill {
  id: string;
  billNumber: string;
  vendorName: string;
  vendorId?: string;
  transactionDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: PurchaseStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentTerm: string; // e.g. "Net 30", "Net 15", "Cash on Delivery"
  items: PurchaseItemLine[];
  notes?: string;
}

export interface CreatePurchaseFormValues {
  vendorName: string;
  billNumber?: string;
  transactionDate: string;
  dueDate: string;
  paymentTerm: string;
  notes?: string;
  items: {
    itemName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
  }[];
}

export interface PayPurchasePayload {
  purchaseId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  paymentAccountId: string;
  notes?: string;
}
