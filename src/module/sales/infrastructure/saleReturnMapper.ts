import type { AmountCount } from '../domain/saleDocument';
import type {
  ReturnActivity,
  ReturnApplication,
  ReturnDisplayStatus,
  ReturnLine,
  ReturnSettlement,
  ReturnStatus,
  ReturnSummary,
  SaleReturn,
} from '../domain/saleReturn';
import { toMoney, toNumber, toRefId } from './saleMapperUtils';
import type {
  ReturnActivityDto,
  ReturnApplicationDto,
  ReturnLineDto,
  ReturnSummaryDto,
  SaleReturnDto,
} from './saleReturnDto';

const STATUSES: ReturnStatus[] = ['DRAFT', 'POSTED', 'VOID'];
const DISPLAY: ReturnDisplayStatus[] = ['DRAFT', 'ISSUED', 'COMPLETED', 'VOID'];

const fallbackDisplay = (status: ReturnStatus): ReturnDisplayStatus =>
  status === 'POSTED' ? 'ISSUED' : status;

const mapLine = (dto: ReturnLineDto): ReturnLine => ({
  id: dto.id || dto._id || '',
  saleItem: toRefId(dto.saleItem) ?? '',
  product: dto.product
    ? { id: dto.product.id || dto.product._id || '', name: dto.product.name || '' }
    : null,
  description: dto.description || '',
  quantity: toNumber(dto.quantity),
  amount: toMoney(dto.amount),
  discountAmount: toMoney(dto.discountAmount),
  taxAmount: toMoney(dto.taxAmount),
  withholdingAmount: toMoney(dto.withholdingAmount),
});

const mapApplication = (dto: ReturnApplicationDto): ReturnApplication => ({
  id: dto.id || dto._id || '',
  sale: toRefId(dto.sale),
  saleNumber: dto.saleNumber || '',
  amount: toMoney(dto.amount),
  appliedAt: dto.appliedAt || null,
  voided: Boolean(dto.voided),
});

const mapActivity = (dto: ReturnActivityDto): ReturnActivity => ({
  type: dto.type || '',
  label: dto.label || '',
  at: dto.at || null,
  by: dto.by?.name || '',
  amount: typeof dto.amount === 'number' ? toMoney(dto.amount) : null,
  saleNumber: dto.saleNumber || '',
  voided: Boolean(dto.voided),
});

export const mapReturnDto = (dto: SaleReturnDto): SaleReturn => {
  const upper = String(dto.status || 'DRAFT').toUpperCase() as ReturnStatus;
  const status = STATUSES.includes(upper) ? upper : 'DRAFT';
  const shown = String(dto.displayStatus || '').toUpperCase() as ReturnDisplayStatus;
  return {
    id: dto.id || dto._id || '',
    transactionNumber: dto.transactionNumber || '',
    transactionDate: dto.transactionDate || null,
    customer: dto.customer
      ? {
          id: dto.customer.id || dto.customer._id || '',
          displayName: dto.customer.displayName || dto.customer.name || '',
          emails: Array.isArray(dto.customer.emails) ? dto.customer.emails : [],
        }
      : null,
    sale: toRefId(dto.sale),
    saleNumber: dto.saleNumber || '',
    reason: dto.reason || '',
    settlement: (dto.settlement === 'CUSTOMER_CREDIT'
      ? 'CUSTOMER_CREDIT'
      : 'REDUCE_INVOICE') as ReturnSettlement,
    memo: dto.memo || '',
    journalId: toRefId(dto.journalTransaction),
    items: (dto.items ?? []).map(mapLine),
    amount: toMoney(dto.amount),
    discountAmount: toMoney(dto.discountAmount),
    net: toMoney(dto.net),
    taxAmount: toMoney(dto.taxAmount),
    withholdingAmount: toMoney(dto.withholdingAmount),
    finalAmount: toMoney(dto.finalAmount),
    appliedToInvoice: toMoney(dto.appliedToInvoice),
    creditUsed: toMoney(dto.creditUsed),
    creditRemaining: toMoney(dto.creditRemaining),
    refundAmount: toMoney(dto.refundAmount),
    status,
    displayStatus: DISPLAY.includes(shown) ? shown : fallbackDisplay(status),
    applications: (dto.applications ?? []).map(mapApplication),
    activities: (dto.activities ?? []).map(mapActivity),
    postedAt: dto.postedAt || null,
    createdAt: dto.createdAt || null,
    updatedAt: dto.updatedAt || null,
  };
};

const amountCount = (value: { amount?: unknown; count?: unknown } | undefined): AmountCount => ({
  amount: toMoney(value?.amount),
  count: toNumber(value?.count),
});

export const mapReturnSummary = (dto: ReturnSummaryDto | undefined): ReturnSummary => ({
  thisMonth: amountCount(dto?.thisMonth),
  credit: amountCount(dto?.credit),
  waiting: amountCount(dto?.waiting),
  counts: {
    draft: toNumber(dto?.counts?.draft),
    issued: toNumber(dto?.counts?.issued),
    completed: toNumber(dto?.counts?.completed),
    cancelled: toNumber(dto?.counts?.cancelled),
  },
});
