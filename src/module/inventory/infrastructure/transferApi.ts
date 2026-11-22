import apiClient from '@/lib/http/apiClient';
import { toApiError } from '@/lib/http/apiError';
import type {
  StockTransfer,
  TransferInput,
  TransferItem,
  TransferWarehouse,
} from '@/module/inventory/domain/stockTransfer';

const TRANSFERS = '/v1/stock/transfers';

type Envelope<T> = { code?: number; message?: string; data: T };

interface TransferItemDto {
  id?: string;
  productId: string;
  name: string;
  sku?: string | null;
  unit?: string | null;
  quantity: number;
  unitCost?: number | null;
  value?: number | null;
}

export interface TransferDto {
  id: string;
  transactionNumber: string;
  transactionDate: string;
  from: TransferWarehouse;
  to: TransferWarehouse;
  items?: TransferItemDto[] | null;
  productCount?: number;
  memo?: string | null;
  status: 'POSTED' | 'VOID';
  voidReason?: string | null;
  voidedAt?: string | null;
  createdAt?: string;
}

const toItem = (dto: TransferItemDto): TransferItem => ({
  productId: dto.productId,
  name: dto.name,
  sku: dto.sku ?? '',
  unit: dto.unit ?? '',
  quantity: dto.quantity,
  unitCost: dto.unitCost ?? null,
  value: dto.value ?? null,
});

export const toTransfer = (dto: TransferDto): StockTransfer => {
  const items = (dto.items ?? []).map(toItem);
  return {
    id: dto.id,
    number: dto.transactionNumber,
    date: dto.transactionDate,
    from: dto.from,
    to: dto.to,
    items,
    productCount: dto.productCount ?? items.length,
    memo: dto.memo ?? '',
    status: dto.status === 'VOID' ? 'void' : 'posted',
    voidReason: dto.voidReason ?? null,
    voidedAt: dto.voidedAt ?? null,
    createdAt: dto.createdAt ?? '',
  };
};

/** The request body: the service names the date `transactionDate` and the note `memo`. */
export const toCreateBody = (input: TransferInput) => {
  const memo = input.memo.trim();
  return {
    transactionDate: input.date,
    fromWarehouse: input.fromWarehouse,
    toWarehouse: input.toWarehouse,
    items: input.lines.map((line) => ({ product: line.product, quantity: line.quantity })),
    ...(memo ? { memo } : {}),
  };
};

export interface TransferListParams {
  page?: number;
  limit?: number;
  status?: 'POSTED' | 'VOID';
  warehouse?: string;
  startDate?: string;
  endDate?: string;
}

export const toTransferQuery = (
  params: TransferListParams
): Record<string, string | number | boolean> => {
  const query: Record<string, string | number | boolean> = {};
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  if (params.status) query.status = params.status;
  if (params.warehouse) query.warehouse = params.warehouse;
  if (params.startDate) query.startDate = params.startDate;
  if (params.endDate) query.endDate = params.endDate;
  return query;
};

export interface TransferPage {
  items: StockTransfer[];
  page: number;
  totalPages: number;
  totalResults: number;
}

const call = async <T>(request: () => Promise<{ data: T }>): Promise<T> => {
  try {
    return (await request()).data;
  } catch (error) {
    throw toApiError(error);
  }
};

export const listTransfers = async (params: TransferListParams = {}): Promise<TransferPage> => {
  const body = await call(() =>
    apiClient.get<
      Envelope<{
        results?: TransferDto[];
        page?: number;
        totalPages?: number;
        totalResults?: number;
      }>
    >(TRANSFERS, { params: toTransferQuery(params) })
  );
  return {
    items: (body.data.results ?? []).map(toTransfer),
    page: body.data.page ?? 1,
    totalPages: body.data.totalPages ?? 0,
    totalResults: body.data.totalResults ?? 0,
  };
};

export const getTransfer = async (id: string): Promise<StockTransfer> => {
  const body = await call(() => apiClient.get<Envelope<TransferDto>>(`${TRANSFERS}/${id}`));
  return toTransfer(body.data);
};

export const createTransfer = async (input: TransferInput): Promise<StockTransfer> => {
  const body = await call(() =>
    apiClient.post<Envelope<TransferDto>>(TRANSFERS, toCreateBody(input))
  );
  return toTransfer(body.data);
};

export const voidTransfer = async (id: string, reason: string): Promise<StockTransfer> => {
  const body = await call(() =>
    apiClient.post<Envelope<TransferDto>>(`${TRANSFERS}/${id}/void`, { reason: reason.trim() })
  );
  return toTransfer(body.data);
};
