import type { SaleDocHeader, SaleDocLine, SaleDocPage } from '../domain/saleDocument';
import type { SaleDocHeaderDto, SaleDocLineDto, SaleDocPageDto } from './saleDocDto';
import { toMoney, toNumber } from './saleMapperUtils';

/** A figure only some servers send: absent stays absent, so a screen can tell "none" from "unknown". */
const optionalNumber = (value: unknown): number | undefined =>
  value === undefined || value === null ? undefined : toNumber(value);

export const mapDocLine = (dto: SaleDocLineDto): SaleDocLine => ({
  id: dto.id || dto._id || '',
  product: dto.product
    ? {
        id: dto.product.id || dto.product._id || '',
        name: dto.product.name || '',
        productCode: dto.product.productCode || dto.product.code,
      }
    : null,
  description: dto.description || '',
  quantity: toNumber(dto.quantity),
  unitPrice: toMoney(dto.unitPrice),
  tax: dto.tax
    ? {
        id: dto.tax.id || dto.tax._id || '',
        name: dto.tax.name || '',
        rate: toNumber(dto.tax.rate),
      }
    : null,
  taxAmount: toMoney(dto.taxAmount),
  amount: toMoney(dto.amount),
  discountAmount: toMoney(dto.discountAmount),
  invoicedQty: optionalNumber(dto.invoicedQty),
  remainingQty: optionalNumber(dto.remainingQty),
});

export const mapDocHeader = (dto: SaleDocHeaderDto): SaleDocHeader => ({
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
  paymentTerm: dto.paymentTerm
    ? {
        id: dto.paymentTerm.id || dto.paymentTerm._id || '',
        name: dto.paymentTerm.name || '',
        days: dto.paymentTerm.days,
      }
    : null,
  unitTower: dto.unitTower || '',
  customerRefNumber: dto.customerRefNumber || '',
  isPriceIncludeTax: Boolean(dto.isPriceIncludeTax),
  items: (dto.items ?? []).map(mapDocLine),
  subtotal: toMoney(dto.subtotal),
  discountType: dto.discountType ?? null,
  discountValue: toNumber(dto.discountValue),
  discountAmount: toMoney(dto.discountAmount),
  taxAmount: toMoney(dto.taxAmount),
  total: toMoney(dto.total),
  terms: dto.terms || '',
  message: dto.message || '',
  memo: dto.memo || '',
  createdAt: dto.createdAt || null,
  updatedAt: dto.updatedAt || null,
});

/** A list answer; `fallbackPage` and `fallbackLimit` stand in when the server leaves them out. */
export const mapDocPage = <Dto, T, SDto, S>(
  dto: SaleDocPageDto<Dto, SDto> | undefined,
  mapItem: (row: Dto) => T,
  mapSummary: (summary: SDto | undefined) => S,
  fallback: { page: number; limit: number }
): SaleDocPage<T, S> => {
  const items = (dto?.results ?? []).map(mapItem);
  return {
    items,
    pagination: {
      total: dto?.totalResults ?? items.length,
      page: dto?.page ?? fallback.page,
      limit: dto?.limit ?? fallback.limit,
      totalPages: dto?.totalPages ?? 1,
    },
    summary: mapSummary(dto?.summary),
    precision: dto?.precision ?? 2,
  };
};
