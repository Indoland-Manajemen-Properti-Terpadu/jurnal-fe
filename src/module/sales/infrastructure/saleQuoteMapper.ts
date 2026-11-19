import type { AmountCount } from '../domain/saleDocument';
import type { QuoteDisplayStatus, QuoteStatus, QuoteSummary, SaleQuote } from '../domain/saleQuote';
import { mapDocHeader } from './saleDocMapper';
import { toMoney, toNumber, toRefId } from './saleMapperUtils';
import type { QuoteSummaryDto, SaleQuoteDto } from './saleQuoteDto';

const STATUSES: QuoteStatus[] = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'VOID'];

const asStatus = (value: string | undefined): QuoteStatus => {
  const status = String(value || 'DRAFT').toUpperCase() as QuoteStatus;
  return STATUSES.includes(status) ? status : 'DRAFT';
};

/** The server's display status (a plain string) wins; without it the stored status is shown. */
const asDisplayStatus = (dto: SaleQuoteDto, status: QuoteStatus): QuoteDisplayStatus => {
  const value = String(dto.displayStatus || '').toUpperCase();
  if (value === 'EXPIRED') return 'EXPIRED';
  return STATUSES.includes(value as QuoteStatus) ? (value as QuoteStatus) : status;
};

export const mapQuoteDto = (dto: SaleQuoteDto): SaleQuote => {
  const status = asStatus(dto.status);
  return {
    ...mapDocHeader(dto),
    validUntil: dto.validUntil || null,
    status,
    displayStatus: asDisplayStatus(dto, status),
    order: toRefId(dto.order),
    emails: Array.isArray(dto.emails) ? dto.emails : [],
    sentAt: dto.sentAt || null,
    acceptedAt: dto.acceptedAt || null,
    attachmentCount: Array.isArray(dto.attachments) ? dto.attachments.length : 0,
  };
};

const amountCount = (value: { amount?: unknown; count?: unknown } | undefined): AmountCount => ({
  amount: toMoney(value?.amount),
  count: toNumber(value?.count),
});

export const mapQuoteSummary = (dto: QuoteSummaryDto | undefined): QuoteSummary => ({
  awaiting: amountCount(dto?.awaiting),
  accepted: amountCount(dto?.accepted),
  counts: {
    running: toNumber(dto?.counts?.running),
    accepted: toNumber(dto?.counts?.accepted),
    finished: toNumber(dto?.counts?.finished),
  },
  conversionRate: typeof dto?.conversionRate === 'number' ? dto.conversionRate : null,
});
