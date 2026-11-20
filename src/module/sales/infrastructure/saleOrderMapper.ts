import type { AmountCount } from '../domain/saleDocument';
import type { OrderInvoice, OrderStatus, OrderSummary, SaleOrder } from '../domain/saleOrder';
import { mapDocHeader } from './saleDocMapper';
import { toMoney, toNumber, toRefId, toRefNumber } from './saleMapperUtils';
import type { OrderInvoiceDto, OrderSummaryDto, SaleOrderDto } from './saleOrderDto';

const STATUSES: OrderStatus[] = [
  'DRAFT',
  'WAITING_CONFIRMATION',
  'CONFIRMED',
  'PARTIALLY_INVOICED',
  'COMPLETED',
  'CANCELLED',
];

const asStatus = (value: string | undefined): OrderStatus => {
  const status = String(value || 'DRAFT').toUpperCase() as OrderStatus;
  return STATUSES.includes(status) ? status : 'DRAFT';
};

const mapInvoice = (dto: OrderInvoiceDto): OrderInvoice => ({
  id: dto.sale?.id || dto.sale?._id || '',
  number: dto.sale?.transactionNumber || '',
  date: dto.transactionDate || null,
  status: dto.status || '',
  amount: toMoney(dto.amount),
});

const optionalMoney = (value: unknown): number | null =>
  value === undefined || value === null ? null : toMoney(value);

export const mapOrderDto = (dto: SaleOrderDto): SaleOrder => ({
  ...mapDocHeader(dto),
  targetDate: dto.targetDate || null,
  deliveryAddress: dto.deliveryAddress || '',
  status: asStatus(dto.status),
  quote: toRefId(dto.quote),
  quoteNumber: toRefNumber(dto.quote),
  sale: toRefId(dto.sale),
  saleNumber: toRefNumber(dto.sale),
  emails: Array.isArray(dto.emails) ? dto.emails : [],
  sentAt: dto.sentAt || null,
  confirmedAt: dto.confirmedAt || null,
  invoices: (dto.invoices ?? []).map(mapInvoice).filter((invoice) => invoice.id),
  invoicedAmount: optionalMoney(dto.invoicedAmount),
  remainingAmount: optionalMoney(dto.remainingAmount),
});

const amountCount = (value: { amount?: unknown; count?: unknown } | undefined): AmountCount => ({
  amount: toMoney(value?.amount),
  count: toNumber(value?.count),
});

export const mapOrderSummary = (dto: OrderSummaryDto | undefined): OrderSummary => ({
  awaiting: amountCount(dto?.awaiting),
  ready: amountCount(dto?.ready),
  partial: amountCount(dto?.partial),
  invoiced: amountCount(dto?.invoiced),
  counts: {
    running: toNumber(dto?.counts?.running),
    finished: toNumber(dto?.counts?.finished),
    cancelled: toNumber(dto?.counts?.cancelled),
  },
});
