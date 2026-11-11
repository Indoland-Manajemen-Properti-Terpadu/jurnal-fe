import type { SalePaymentDetail } from '../domain/sale';

/** Raw API shapes for sales. Fields use the spellings the backend has sent (`_id`, snake_case). */

export type IdRefDto = { id?: string; _id?: string };

export type SaleProductDto = IdRefDto & { name?: string; productCode?: string; code?: string };

export type SaleTaxDto = IdRefDto & { name?: string; rate?: unknown };

export type SaleItemDto = IdRefDto & {
  product?: SaleProductDto | null;
  description?: string;
  unit?: string | { name?: string } | null;
  quantity?: unknown;
  unitPrice?: unknown;
  unit_price?: unknown;
  tax?: SaleTaxDto | null;
  taxAmount?: unknown;
  amount?: unknown;
  adjustedAmount?: unknown;
  paidAmount?: unknown;
  outstandingAmount?: unknown;
  discountAmount?: unknown;
  withholdingAmount?: unknown;
  journalTransaction?: string | IdRefDto | null;
  journalId?: string;
  journal_id?: string;
  transactionId?: string;
  transaction_id?: string;
  transactionJournalId?: string;
  journalTransactionId?: string;
  journal?: IdRefDto | null;
  salesAccount?: string | IdRefDto | null;
  accountReceivable?: string | IdRefDto | null;
};

export type SaleAttachmentDto = IdRefDto & {
  fileName?: string;
  name?: string;
  filePath?: string;
  path?: string;
  mimeType?: string;
  createdAt?: string;
};

export type SaleTagDto = string | (IdRefDto & { name?: string });

export type SaleCustomerDto = IdRefDto & {
  displayName?: string;
  name?: string;
  fullName?: {
    prefix?: string | null;
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
  } | null;
  contactNumber?: string;
  emails?: string[];
  phones?: { mobile?: string | null; telephone?: string | null } | null;
  addresses?: { billing?: { general?: string } };
  billingAddress?: string | null;
  identity?: { type?: string | null; number?: string | null } | null;
};

export type SalePaymentTermDto = IdRefDto & { name?: string; days?: number; isDefault?: boolean };

export type SaleWithholdingAccountDto = IdRefDto & { name?: string; accountNumber?: string };

export type SaleDto = IdRefDto & {
  site?: string;
  transactionNumber?: string;
  transaction_number?: string;
  customer?: SaleCustomerDto | null;
  emails?: string[];
  billingAddress?: string | null;
  transactionDate?: string | null;
  dueDate?: string | null;
  tags?: SaleTagDto[] | string;
  tag?: SaleTagDto[] | string;
  customerRefNumber?: string | null;
  paymentTerm?: SalePaymentTermDto | null;
  isPriceIncludeTax?: boolean;
  items?: SaleItemDto[];
  subtotal?: unknown;
  discountType?: 'percentage' | 'nominal' | null;
  discountValue?: unknown;
  discountAmount?: unknown;
  taxAmount?: unknown;
  total?: unknown;
  adjustedAmount?: unknown;
  lateFeeAmount?: unknown;
  lateFeePaidAmount?: unknown;
  outstandingLateFee?: unknown;
  withholdingType?: 'percentage' | 'nominal' | null;
  withholdingValue?: unknown;
  withholdingAmount?: unknown;
  withholdingAccount?: SaleWithholdingAccountDto | null;
  finalAmount?: unknown;
  paidAmount?: unknown;
  remainingAmount?: unknown;
  attachments?: SaleAttachmentDto[];
  message?: string | null;
  memo?: string | null;
  status?: string;
  displayStatus?: { code?: string; label?: string } | null;
  canEdit?: boolean;
  canDelete?: boolean;
  createdByApi?: boolean;
  invoiceLink?: string | null;
  journalId?: string;
  journal_id?: string;
  journalTransactionId?: string;
  transactionJournalId?: string;
  journal?: IdRefDto | null;
  transactionId?: string;
  transaction_id?: string;
  deleted?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type SalePaymentDetailDto = IdRefDto & {
  site?: string;
  sale?: SalePaymentDetail['sale'];
  depositAccount?: SalePaymentDetail['depositAccount'];
  paymentMethod?: SalePaymentDetail['paymentMethod'];
  paymentDate?: string | null;
  amount?: unknown;
  transactionNumber?: string;
  memo?: string | null;
  createdAt?: string | null;
};

export type SalePaymentResultDto = {
  overpaymentAmount?: unknown;
  lateFeeAmount?: unknown;
  items?: Array<
    IdRefDto & {
      saleItem?: string | IdRefDto | null;
      product?: SaleProductDto | null;
      amount?: unknown;
    }
  >;
};

export type SalePaymentRowDto = IdRefDto & {
  transactionNumber?: string;
  paymentDate?: string | null;
  amount?: unknown;
  overpaymentAmount?: unknown;
  lateFeeAmount?: unknown;
  memo?: string | null;
  sale?: (IdRefDto & { transactionNumber?: string; customer?: SaleCustomerDto | null }) | null;
  items?: Array<IdRefDto & { saleItem?: string | IdRefDto | null; amount?: unknown }>;
  paymentMethod?: { name?: string } | null;
  depositAccount?: { name?: string } | null;
};

export type SalePaymentMethodDto = IdRefDto & {
  name?: string;
  adminFee?: unknown;
  external_id?: string;
  isDefault?: boolean;
  defaultAccount?: string | { id?: string; name?: string } | null;
  feeAccount?: string | { id?: string; name?: string } | null;
};

export type ReceivablesSummaryDto = {
  overdue?: { amount?: unknown; count?: unknown; oldestDueDate?: string | null };
  notDue?: { amount?: unknown; count?: unknown };
  total?: { amount?: unknown; count?: unknown };
  billed?: unknown;
  received?: unknown;
};

export type SaleStatusCountsDto = Partial<
  Record<'DRAFT' | 'UNPAID' | 'PAID' | 'OVERDUE' | 'VOID' | 'sent' | 'all', unknown>
>;
