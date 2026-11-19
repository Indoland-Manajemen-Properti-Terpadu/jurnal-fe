import type { DiscountType, Pagination } from './sale';

/**
 * What quotes, orders and returns have in common: lines, customer and an amount with a count.
 * Each document keeps its own status, tabs and actions in its own file.
 */
export interface SaleDocCustomer {
  id: string;
  displayName: string;
  /** The customer's own addresses; what a document is emailed to when none is typed. */
  emails: string[];
}

export interface SaleDocLine {
  id: string;
  product: { id: string; name: string; productCode?: string } | null;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: { id: string; name: string; rate: number } | null;
  taxAmount: number;
  /** Quantity times unit price, before the discount. */
  amount: number;
  /** This line's share of the document discount. */
  discountAmount: number;
}

/** The parts of a quote or an order that the two share. */
export interface SaleDocHeader {
  id: string;
  transactionNumber: string;
  transactionDate: string | null;
  customer: SaleDocCustomer | null;
  paymentTerm: { id: string; name: string; days?: number } | null;
  unitTower: string;
  customerRefNumber: string;
  isPriceIncludeTax: boolean;
  items: SaleDocLine[];
  subtotal: number;
  discountType: DiscountType | null;
  discountValue: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  terms: string;
  message: string;
  memo: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AmountCount {
  amount: number;
  count: number;
}

/** A page of documents with the figures the list shows above its table. */
export interface SaleDocPage<T, S> {
  items: T[];
  pagination: Pagination;
  summary: S;
  precision: number;
}

export interface SaleDocListParams<Tab extends string, Status extends string = string> {
  tab?: Tab;
  status?: Status | 'all';
  customer?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/** What the API accepts when a quote or an order is emailed. */
export const DOC_MAX_EMAILS = 10;
export const DOC_MAX_MESSAGE = 2000;
