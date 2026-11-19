import type { SaleDocHeaderDto } from './saleDocDto';

export type SaleQuoteDto = SaleDocHeaderDto & {
  validUntil?: string | null;
  status?: string;
  displayStatus?: string | null;
  order?: string | { id?: string; _id?: string; transactionNumber?: string } | null;
  emails?: string[];
  sentAt?: string | null;
  acceptedAt?: string | null;
  attachments?: unknown[];
  /** Present on the answer to a send. */
  emailSent?: boolean;
  emailRecipients?: string[];
  emailError?: string | null;
};

type AmountCountDto = { amount?: unknown; count?: unknown };

export type QuoteSummaryDto = {
  awaiting?: AmountCountDto;
  accepted?: AmountCountDto;
  counts?: { running?: unknown; accepted?: unknown; finished?: unknown };
  conversionRate?: number | null;
};
