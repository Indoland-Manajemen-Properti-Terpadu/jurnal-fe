/** Raw API shapes shared by quotes and orders. */

type IdRef = { id?: string; _id?: string };

export type SaleDocCustomerDto = IdRef & { displayName?: string; name?: string; emails?: string[] };
export type SaleDocProductDto = IdRef & { name?: string; productCode?: string; code?: string };
export type SaleDocTaxDto = IdRef & { name?: string; rate?: unknown };

export type SaleDocLineDto = IdRef & {
  product?: SaleDocProductDto | null;
  description?: string;
  quantity?: unknown;
  unitPrice?: unknown;
  tax?: SaleDocTaxDto | null;
  taxAmount?: unknown;
  amount?: unknown;
  discountAmount?: unknown;
  /** Orders only. */
  invoicedQty?: unknown;
  remainingQty?: unknown;
};

export type SaleDocHeaderDto = IdRef & {
  transactionNumber?: string;
  transactionDate?: string | null;
  customer?: SaleDocCustomerDto | null;
  paymentTerm?: (IdRef & { name?: string; days?: number }) | null;
  unitTower?: string | null;
  customerRefNumber?: string | null;
  isPriceIncludeTax?: boolean;
  items?: SaleDocLineDto[];
  subtotal?: unknown;
  discountType?: 'percentage' | 'nominal' | null;
  discountValue?: unknown;
  discountAmount?: unknown;
  taxAmount?: unknown;
  total?: unknown;
  terms?: string | null;
  message?: string | null;
  memo?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

/** The list envelope the new sales documents use: `data.results` plus the figures above the table. */
export type SaleDocPageDto<T, S> = {
  results?: T[];
  page?: number;
  limit?: number;
  totalPages?: number;
  totalResults?: number;
  summary?: S;
  precision?: number;
};
