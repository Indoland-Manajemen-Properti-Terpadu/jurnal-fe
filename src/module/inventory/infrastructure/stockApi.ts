import apiClient from '@/lib/http/apiClient';
import { toApiError } from '@/lib/http/apiError';
import type {
  BalanceReport,
  BalanceRow,
  BalanceWarehouse,
} from '@/module/inventory/domain/stockBalance';
import type { StockCard, StockCardRow } from '@/module/inventory/domain/stockCard';
import type {
  CostBreakdown,
  MovementTotals,
  StockMovement,
} from '@/module/inventory/domain/stockMovement';

const STOCK = '/v1/stock';

type Envelope<T> = { code?: number; message?: string; data: T };
type Query = Record<string, string | number | boolean>;

const text = (value: string | null | undefined) => value ?? '';

/* ---------- Balances ---------- */

interface BalanceRowDto {
  id: string;
  name: string;
  sku?: string | null;
  unit?: string | null;
  quantities?: Record<string, number> | null;
  totalQty?: number | null;
  avgCost?: number | null;
  value?: number | null;
}

export interface BalanceReportDto {
  asOf: string;
  warehouses?: BalanceWarehouse[] | null;
  rows?: BalanceRowDto[] | null;
  summary?: {
    inventoryValue?: number | null;
    trackedProducts?: number;
    belowMinCount?: number;
    emptyCount?: number;
  } | null;
  reconciliation?: { matches: boolean; stockValue: number; ledgerValue: number } | null;
}

const toBalanceRow = (dto: BalanceRowDto): BalanceRow => ({
  productId: dto.id,
  name: dto.name,
  sku: text(dto.sku),
  unit: text(dto.unit),
  quantities: dto.quantities ?? {},
  totalQty: dto.totalQty ?? 0,
  avgCost: dto.avgCost ?? null,
  value: dto.value ?? null,
});

export const toBalanceReport = (dto: BalanceReportDto): BalanceReport => ({
  asOf: dto.asOf,
  warehouses: dto.warehouses ?? [],
  rows: (dto.rows ?? []).map(toBalanceRow),
  summary: {
    inventoryValue: dto.summary?.inventoryValue ?? null,
    trackedProducts: dto.summary?.trackedProducts ?? 0,
    belowMinCount: dto.summary?.belowMinCount ?? 0,
    emptyCount: dto.summary?.emptyCount ?? 0,
  },
  reconciliation: dto.reconciliation
    ? {
        matches: dto.reconciliation.matches,
        stockValue: dto.reconciliation.stockValue,
        ledgerValue: dto.reconciliation.ledgerValue,
      }
    : null,
});

export interface BalanceParams {
  asOf?: string;
  warehouse?: string;
  q?: string;
}

/** Only what was chosen; the service refuses empty and unknown query values. */
export const toBalanceQuery = (params: BalanceParams): Query => {
  const query: Query = {};
  if (params.asOf) query.asOf = params.asOf;
  if (params.warehouse) query.warehouse = params.warehouse;
  const q = params.q?.trim();
  if (q) query.q = q;
  return query;
};

/* ---------- Movements ---------- */

interface MovementDto {
  id: string;
  date: string;
  type: string;
  typeLabel?: string | null;
  isReversal?: boolean | null;
  documentNumber?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  product?: { id: string; name: string; sku?: string | null; unit?: string | null } | null;
  warehouse: { id: string; code: string; name: string };
  quantityIn?: number | null;
  quantityOut?: number | null;
  unitCost?: number | null;
  value?: number | null;
  journalTransaction?: string | null;
  costBreakdown?: CostBreakdown | null;
}

export const toMovement = (dto: MovementDto): StockMovement => ({
  id: dto.id,
  date: dto.date,
  type: dto.type,
  typeLabel: text(dto.typeLabel),
  isReversal: dto.isReversal === true,
  documentNumber: text(dto.documentNumber),
  sourceType: text(dto.sourceType),
  sourceId: text(dto.sourceId),
  productId: dto.product?.id ?? '',
  productName: text(dto.product?.name),
  sku: text(dto.product?.sku),
  unit: text(dto.product?.unit),
  warehouse: dto.warehouse,
  quantityIn: dto.quantityIn ?? 0,
  quantityOut: dto.quantityOut ?? 0,
  unitCost: dto.unitCost ?? null,
  value: dto.value ?? null,
  journalId: dto.journalTransaction || null,
  costBreakdown: dto.costBreakdown ?? null,
});

export interface MovementParams {
  startDate?: string;
  endDate?: string;
  warehouse?: string;
  product?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export const toMovementQuery = (params: MovementParams): Query => {
  const query: Query = {};
  if (params.startDate) query.startDate = params.startDate;
  if (params.endDate) query.endDate = params.endDate;
  if (params.warehouse) query.warehouse = params.warehouse;
  if (params.product) query.product = params.product;
  if (params.type) query.type = params.type;
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  return query;
};

export interface MovementPage {
  items: StockMovement[];
  page: number;
  totalPages: number;
  totalResults: number;
  totals: MovementTotals;
}

interface MovementPageDto {
  results?: MovementDto[] | null;
  page?: number;
  totalPages?: number;
  totalResults?: number;
  totals?: {
    count?: number;
    inQty?: number;
    outQty?: number;
    inValue?: number | null;
    outValue?: number | null;
  } | null;
}

export const toMovementPage = (dto: MovementPageDto): MovementPage => ({
  items: (dto.results ?? []).map(toMovement),
  page: dto.page ?? 1,
  totalPages: dto.totalPages ?? 0,
  totalResults: dto.totalResults ?? 0,
  totals: {
    count: dto.totals?.count ?? dto.totalResults ?? 0,
    inQty: dto.totals?.inQty ?? 0,
    outQty: dto.totals?.outQty ?? 0,
    inValue: dto.totals?.inValue ?? null,
    outValue: dto.totals?.outValue ?? null,
  },
});

/* ---------- Stock card ---------- */

interface CardRowDto extends MovementDto {
  balanceQty?: number | null;
  balanceValue?: number | null;
  avgCost?: number | null;
}

interface StockCardDto {
  product: {
    id: string;
    name: string;
    sku?: string | null;
    unit?: string | null;
    category?: string | null;
  };
  warehouse?: { id: string; code: string; name: string } | null;
  from?: string | null;
  to?: string | null;
  transfersExcluded?: boolean;
  opening?: { quantity?: number; value?: number | null };
  closing?: { quantity?: number; value?: number | null };
  totalIn?: number;
  totalOut?: number;
  rows?: CardRowDto[] | null;
}

const toCardRow = (dto: CardRowDto): StockCardRow => ({
  id: dto.id,
  date: dto.date,
  type: dto.type,
  typeLabel: text(dto.typeLabel),
  isReversal: dto.isReversal === true,
  documentNumber: text(dto.documentNumber),
  sourceType: text(dto.sourceType),
  sourceId: text(dto.sourceId),
  warehouse: dto.warehouse,
  quantityIn: dto.quantityIn ?? 0,
  quantityOut: dto.quantityOut ?? 0,
  balanceQty: dto.balanceQty ?? 0,
  unitCost: dto.unitCost ?? null,
  value: dto.value ?? null,
  balanceValue: dto.balanceValue ?? null,
  avgCost: dto.avgCost ?? null,
  journalId: dto.journalTransaction || null,
});

export const toStockCard = (dto: StockCardDto): StockCard => ({
  product: {
    id: dto.product.id,
    name: dto.product.name,
    sku: text(dto.product.sku),
    unit: text(dto.product.unit),
    category: text(dto.product.category),
  },
  warehouse: dto.warehouse ?? null,
  from: dto.from ?? null,
  to: dto.to ?? null,
  transfersExcluded: dto.transfersExcluded === true,
  opening: { quantity: dto.opening?.quantity ?? 0, value: dto.opening?.value ?? null },
  closing: { quantity: dto.closing?.quantity ?? 0, value: dto.closing?.value ?? null },
  totalIn: dto.totalIn ?? 0,
  totalOut: dto.totalOut ?? 0,
  rows: (dto.rows ?? []).map(toCardRow),
});

export interface CardParams {
  product: string;
  warehouse?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------- Calls ---------- */

const call = async <T>(request: () => Promise<{ data: T }>): Promise<T> => {
  try {
    return (await request()).data;
  } catch (error) {
    throw toApiError(error);
  }
};

export const fetchBalances = async (params: BalanceParams = {}): Promise<BalanceReport> => {
  const body = await call(() =>
    apiClient.get<Envelope<BalanceReportDto>>(`${STOCK}/balances`, {
      params: toBalanceQuery(params),
    })
  );
  return toBalanceReport(body.data);
};

export const fetchMovements = async (params: MovementParams = {}): Promise<MovementPage> => {
  const body = await call(() =>
    apiClient.get<Envelope<MovementPageDto>>(`${STOCK}/movements`, {
      params: toMovementQuery(params),
    })
  );
  return toMovementPage(body.data);
};

export const fetchStockCard = async (params: CardParams): Promise<StockCard> => {
  const query: Query = { product: params.product };
  if (params.warehouse) query.warehouse = params.warehouse;
  if (params.startDate) query.startDate = params.startDate;
  if (params.endDate) query.endDate = params.endDate;
  const body = await call(() =>
    apiClient.get<Envelope<StockCardDto>>(`${STOCK}/card`, { params: query })
  );
  return toStockCard(body.data);
};

/** The workbook for the figures on screen; the file name comes from the caller. */
export const exportStock = async (
  scope: 'balances' | 'movements',
  params: BalanceParams & MovementParams
): Promise<Blob> => {
  const query: Query = {
    scope,
    ...(scope === 'balances' ? toBalanceQuery(params) : toMovementQuery(params)),
  };
  return call(() =>
    apiClient.get<Blob>(`${STOCK}/export`, { params: query, responseType: 'blob' })
  );
};
