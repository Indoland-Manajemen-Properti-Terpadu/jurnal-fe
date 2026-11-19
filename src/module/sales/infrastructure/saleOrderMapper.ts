import type { AmountCount } from '../domain/saleDocument';
import type { OrderStatus, OrderSummary, SaleOrder } from '../domain/saleOrder';
import { mapDocHeader } from './saleDocMapper';
import { toMoney, toNumber, toRefId, toRefNumber } from './saleMapperUtils';
import type { OrderSummaryDto, SaleOrderDto } from './saleOrderDto';

const STATUSES: OrderStatus[] = [
  'DRAFT',
  'WAITING_CONFIRMATION',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
];

const asStatus = (value: string | undefined): OrderStatus => {
  const status = String(value || 'DRAFT').toUpperCase() as OrderStatus;
  return STATUSES.includes(status) ? status : 'DRAFT';
};

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
});

const amountCount = (value: { amount?: unknown; count?: unknown } | undefined): AmountCount => ({
  amount: toMoney(value?.amount),
  count: toNumber(value?.count),
});

export const mapOrderSummary = (dto: OrderSummaryDto | undefined): OrderSummary => ({
  awaiting: amountCount(dto?.awaiting),
  ready: amountCount(dto?.ready),
  invoiced: amountCount(dto?.invoiced),
  counts: {
    running: toNumber(dto?.counts?.running),
    finished: toNumber(dto?.counts?.finished),
    cancelled: toNumber(dto?.counts?.cancelled),
  },
});
