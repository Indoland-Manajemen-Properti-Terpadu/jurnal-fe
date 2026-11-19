import type { SaleDocHeaderDto } from './saleDocDto';

/** A linked document: a bare id, or `{ id, transactionNumber }` on the newer API. */
type DocRefDto = string | { id?: string; _id?: string; transactionNumber?: string } | null;

export type SaleOrderDto = SaleDocHeaderDto & {
  targetDate?: string | null;
  deliveryAddress?: string | null;
  status?: string;
  quote?: DocRefDto;
  sale?: DocRefDto;
  emails?: string[];
  /** Present on the answer to a send or a resend. */
  emailSent?: boolean;
  emailRecipients?: string[];
  emailError?: string | null;
  sentAt?: string | null;
  confirmedAt?: string | null;
};

type AmountCountDto = { amount?: unknown; count?: unknown };

export type OrderSummaryDto = {
  awaiting?: AmountCountDto;
  ready?: AmountCountDto;
  invoiced?: AmountCountDto;
  counts?: { running?: unknown; finished?: unknown; cancelled?: unknown };
};
