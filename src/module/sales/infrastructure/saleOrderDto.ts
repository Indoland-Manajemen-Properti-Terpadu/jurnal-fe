import type { SaleDocHeaderDto } from './saleDocDto';

export type SaleOrderDto = SaleDocHeaderDto & {
  targetDate?: string | null;
  deliveryAddress?: string | null;
  status?: string;
  quote?: string | { id?: string; _id?: string } | null;
  sale?: string | { id?: string; _id?: string } | null;
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
