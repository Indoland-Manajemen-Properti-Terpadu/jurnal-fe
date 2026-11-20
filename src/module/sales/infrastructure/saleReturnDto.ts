import type { SaleDocCustomerDto } from './saleDocDto';

type IdRef = { id?: string; _id?: string };

export type ReturnLineDto = IdRef & {
  saleItem?: string | IdRef | null;
  product?: (IdRef & { name?: string }) | null;
  description?: string;
  quantity?: unknown;
  amount?: unknown;
  discountAmount?: unknown;
  taxAmount?: unknown;
  withholdingAmount?: unknown;
};

export type ReturnApplicationDto = IdRef & {
  sale?: string | IdRef | null;
  saleNumber?: string;
  amount?: unknown;
  appliedAt?: string | null;
  voided?: boolean;
};

export type ReturnActivityDto = {
  type?: string;
  label?: string;
  at?: string | null;
  by?: { id?: string; name?: string } | null;
  amount?: unknown;
  saleNumber?: string;
  voided?: boolean;
};

export type SaleReturnDto = IdRef & {
  transactionNumber?: string;
  transactionDate?: string | null;
  customer?: SaleDocCustomerDto | null;
  sale?: string | IdRef | null;
  saleNumber?: string;
  reason?: string;
  settlement?: string;
  /** The journal an issued return posted: an id, or the journal itself. */
  journalTransaction?: string | IdRef | null;
  memo?: string | null;
  items?: ReturnLineDto[];
  amount?: unknown;
  discountAmount?: unknown;
  net?: unknown;
  taxAmount?: unknown;
  withholdingAmount?: unknown;
  finalAmount?: unknown;
  appliedToInvoice?: unknown;
  creditUsed?: unknown;
  creditRemaining?: unknown;
  refundAmount?: unknown;
  status?: string;
  displayStatus?: string | null;
  applications?: ReturnApplicationDto[];
  activities?: ReturnActivityDto[];
  postedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type AmountCountDto = { amount?: unknown; count?: unknown };

export type ReturnSummaryDto = {
  thisMonth?: AmountCountDto;
  credit?: AmountCountDto;
  waiting?: AmountCountDto;
  counts?: { draft?: unknown; issued?: unknown; completed?: unknown; cancelled?: unknown };
};
