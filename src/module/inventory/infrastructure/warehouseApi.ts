import { isAxiosError } from 'axios';
import apiClient from '@/lib/http/apiClient';
import { toApiError } from '@/lib/http/apiError';
import {
  sortBlockReasons,
  stockStatus,
  type AuditEntry,
  type BlockReason,
  type Warehouse,
  type WarehouseInput,
  type WarehouseMove,
  type WarehouseStockItem,
  type WarehouseSummary,
} from '@/module/inventory/domain/warehouse';

const WAREHOUSES = '/v1/warehouses';
const MOVEMENTS = '/v1/stock/movements';
const LATEST_MOVES = 20;

type Envelope<T> = { code?: number; message?: string; data: T };

interface PersonDto {
  id: string;
  name: string;
}

interface OpnameDto {
  id: string;
  number: string;
  date?: string;
  status?: string;
}

/**
 * What the service sends. The text fields are empty strings on a stored warehouse; the value and
 * the opname refs are missing when they do not apply or when the person may not see values.
 */
export interface WarehouseDto {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  notes?: string | null;
  picUser?: PersonDto | null;
  isDefault?: boolean | null;
  isActive?: boolean | null;
  runningOpname?: OpnameDto | null;
  lastOpname?: OpnameDto | null;
  itemCount?: number | null;
  inventoryValue?: number | null;
  canDelete?: boolean | null;
  codeLocked?: boolean | null;
  createdAt?: string;
  createdByUser?: PersonDto | null;
  summary?: { itemCount?: number; inventoryValue?: number | null; belowMinCount?: number };
}

interface ListDto {
  results?: WarehouseDto[] | null;
  page?: number;
  totalPages?: number;
  totalResults?: number;
  summary?: {
    totalCount?: number;
    activeCount?: number;
    itemCount?: number;
    inventoryValue?: number | null;
  };
}

interface StockItemDto {
  productId: string;
  name: string;
  sku?: string | null;
  unit?: string | null;
  quantity: number;
  minQty?: number | null;
  avgCost?: number | null;
  value?: number | null;
}

interface MoveDto {
  id: string;
  date?: string;
  typeLabel?: string;
  isReversal?: boolean;
  documentNumber?: string | null;
  product?: { name?: string } | null;
  quantityIn?: number;
  quantityOut?: number;
  unitCost?: number | null;
  value?: number | null;
  journalTransaction?: string | null;
}

interface AuditDto {
  id: string;
  action?: string;
  createdAt: string;
  performedByUser?: PersonDto | null;
  changes?: { field: string; from?: unknown; to?: unknown }[];
}

export interface WarehouseListParams {
  search?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}

export interface WarehousePage {
  items: Warehouse[];
  page: number;
  totalPages: number;
  totalResults: number;
  summary: WarehouseSummary;
}

const text = (value: string | null | undefined) => value ?? '';

export const toWarehouse = (dto: WarehouseDto): Warehouse => ({
  id: dto.id,
  code: dto.code,
  name: dto.name,
  address: text(dto.address),
  city: text(dto.city),
  postalCode: text(dto.postalCode),
  phone: text(dto.phone),
  notes: text(dto.notes),
  picUser: dto.picUser ? { id: dto.picUser.id, name: dto.picUser.name } : null,
  isDefault: dto.isDefault === true,
  isActive: dto.isActive !== false,
  runningOpname: dto.runningOpname
    ? { id: dto.runningOpname.id, number: dto.runningOpname.number }
    : null,
  lastOpname:
    dto.lastOpname && dto.lastOpname.date
      ? { id: dto.lastOpname.id, number: dto.lastOpname.number, date: dto.lastOpname.date }
      : null,
  itemCount: dto.itemCount ?? dto.summary?.itemCount ?? 0,
  inventoryValue: dto.inventoryValue ?? dto.summary?.inventoryValue ?? null,
  belowMinCount: dto.summary?.belowMinCount ?? 0,
  canDelete: dto.canDelete === true,
  codeLocked: dto.codeLocked === true,
  createdAt: dto.createdAt ?? '',
  createdBy: dto.createdByUser ? { id: dto.createdByUser.id, name: dto.createdByUser.name } : null,
});

/** Only the filters that were chosen; the service refuses empty and unknown query values. */
export const toWarehouseQuery = (
  params: WarehouseListParams
): Record<string, string | number | boolean> => {
  const query: Record<string, string | number | boolean> = {};
  const search = params.search?.trim();
  if (search) query.q = search;
  if (params.status) query.status = params.status;
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  return query;
};

export const toStockItem = (dto: StockItemDto): WarehouseStockItem => {
  const minQty = dto.minQty ?? 0;
  return {
    productId: dto.productId,
    name: dto.name,
    sku: text(dto.sku),
    unit: text(dto.unit),
    quantity: dto.quantity,
    minQty,
    status: stockStatus(dto.quantity, minQty),
    avgCost: dto.avgCost ?? null,
    value: dto.value ?? null,
  };
};

export const toMove = (dto: MoveDto): WarehouseMove => ({
  id: dto.id,
  date: text(dto.date),
  typeLabel: text(dto.typeLabel),
  isReversal: dto.isReversal === true,
  documentNumber: text(dto.documentNumber),
  productName: text(dto.product?.name),
  quantityIn: dto.quantityIn ?? 0,
  quantityOut: dto.quantityOut ?? 0,
  unitCost: dto.unitCost ?? null,
  value: dto.value ?? null,
  hasJournal: Boolean(dto.journalTransaction),
});

const show = (value: unknown): string | null => {
  if (value === null || value === undefined || value === '') return null;
  return typeof value === 'string' ? value : String(value);
};

const toAudit = (dto: AuditDto): AuditEntry => ({
  id: dto.id,
  at: dto.createdAt,
  action: text(dto.action),
  userName: dto.performedByUser?.name ?? '',
  changes: (dto.changes ?? []).map((change) => ({
    field: change.field,
    from: show(change.from),
    to: show(change.to),
  })),
});

interface ReasonDto {
  code?: string;
  message?: string;
  opname?: { id?: string; number?: string; status?: string };
  itemCount?: number;
  value?: number;
  count?: number;
}

/**
 * Reads the refusal of a deactivation. Only `RUNNING_OPNAME` is confirmed against the service; the
 * other codes are matched by name and anything unknown keeps the service's sentence.
 */
export const toBlockReasons = (data: { reasons?: ReasonDto[] } | undefined): BlockReason[] => {
  const reasons = (data?.reasons ?? []).map((reason): BlockReason => {
    const code = (reason.code ?? '').toUpperCase();
    if (code === 'RUNNING_OPNAME' && reason.opname?.number) {
      return { kind: 'opname', number: reason.opname.number, id: reason.opname.id ?? '' };
    }
    if (code.includes('DEFAULT')) return { kind: 'default' };
    if (code.includes('STOCK')) {
      return { kind: 'stock', itemCount: reason.itemCount ?? null, value: reason.value ?? null };
    }
    if (code.includes('ORDER') || code.includes('PO')) {
      return { kind: 'orders', count: reason.count ?? null };
    }
    return { kind: 'other', message: text(reason.message) };
  });
  return sortBlockReasons(reasons);
};

/** A deactivation the service refused, with every reason it gave. */
export class WarehouseBlockedError extends Error {
  readonly reasons: BlockReason[];
  constructor(reasons: BlockReason[]) {
    super('warehouse-blocked');
    this.name = 'WarehouseBlockedError';
    this.reasons = reasons;
  }
}

const call = async <T>(request: () => Promise<{ data: T }>): Promise<T> => {
  try {
    return (await request()).data;
  } catch (error) {
    throw toApiError(error);
  }
};

export const fetchWarehouses = async (params: WarehouseListParams = {}): Promise<WarehousePage> => {
  const body = await call(() =>
    apiClient.get<Envelope<ListDto>>(WAREHOUSES, { params: toWarehouseQuery(params) })
  );
  const list = body.data ?? {};
  const results = list.results ?? [];
  return {
    items: results.map(toWarehouse),
    page: list.page ?? 1,
    totalPages: list.totalPages ?? 0,
    totalResults: list.totalResults ?? 0,
    summary: {
      totalCount: list.summary?.totalCount ?? results.length,
      activeCount: list.summary?.activeCount ?? 0,
      itemCount: list.summary?.itemCount ?? 0,
      inventoryValue: list.summary?.inventoryValue ?? null,
    },
  };
};

export const fetchWarehouse = async (id: string): Promise<Warehouse> => {
  const body = await call(() => apiClient.get<Envelope<WarehouseDto>>(`${WAREHOUSES}/${id}`));
  return toWarehouse(body.data);
};

export const fetchWarehouseStock = async (id: string): Promise<WarehouseStockItem[]> => {
  const body = await call(() =>
    apiClient.get<Envelope<{ items?: StockItemDto[] }>>(`${WAREHOUSES}/${id}/stock`)
  );
  return (body.data.items ?? []).map(toStockItem);
};

export const fetchWarehouseMoves = async (id: string): Promise<WarehouseMove[]> => {
  const body = await call(() =>
    apiClient.get<Envelope<{ results?: MoveDto[] }>>(MOVEMENTS, {
      params: { warehouse: id, limit: LATEST_MOVES },
    })
  );
  return (body.data.results ?? []).map(toMove);
};

export const fetchWarehouseAudit = async (id: string): Promise<AuditEntry[]> => {
  const body = await call(() =>
    apiClient.get<Envelope<{ results?: AuditDto[] }>>(`${WAREHOUSES}/${id}/audit-log`)
  );
  return (body.data.results ?? []).map(toAudit);
};

export interface PicOption {
  id: string;
  name: string;
}

export const fetchPicOptions = async (): Promise<PicOption[]> => {
  const body = await call(() => apiClient.get<Envelope<PicOption[]>>(`${WAREHOUSES}/pic-options`));
  return (body.data ?? []).map(({ id, name }) => ({ id, name }));
};

/** The body of a save: a blank code is left out so the service numbers a new warehouse itself. */
const toBody = (input: WarehouseInput) => {
  const { code, picUserId, ...rest } = input;
  return { ...rest, ...(code ? { code } : {}), ...(picUserId ? { picUserId } : {}) };
};

export const createWarehouse = async (input: WarehouseInput): Promise<Warehouse> => {
  const body = await call(() => apiClient.post<Envelope<WarehouseDto>>(WAREHOUSES, toBody(input)));
  return toWarehouse(body.data);
};

export const updateWarehouse = async (id: string, input: WarehouseInput): Promise<Warehouse> => {
  const body = await call(() =>
    apiClient.put<Envelope<WarehouseDto>>(`${WAREHOUSES}/${id}`, {
      ...toBody(input),
      picUserId: input.picUserId,
    })
  );
  return toWarehouse(body.data);
};

export const setDefaultWarehouse = async (id: string): Promise<void> => {
  await call(() => apiClient.patch(`${WAREHOUSES}/${id}/default`, {}));
};

export const setWarehouseActive = async (id: string, isActive: boolean): Promise<void> => {
  try {
    await apiClient.patch(`${WAREHOUSES}/${id}/status`, {
      status: isActive ? 'active' : 'inactive',
    });
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 409) {
      const data = (error.response.data as Envelope<{ reasons?: ReasonDto[] }> | undefined)?.data;
      const reasons = toBlockReasons(data);
      if (reasons.length > 0) throw new WarehouseBlockedError(reasons);
    }
    throw toApiError(error);
  }
};

export const setMinStock = async (
  id: string,
  productId: string,
  minQty: number
): Promise<WarehouseStockItem[]> => {
  const body = await call(() =>
    apiClient.put<Envelope<{ items?: StockItemDto[] }>>(`${WAREHOUSES}/${id}/min-stock`, {
      items: [{ productId, minQty }],
    })
  );
  return (body.data.items ?? []).map(toStockItem);
};

export const deleteWarehouse = async (id: string): Promise<void> => {
  await call(() => apiClient.delete(`${WAREHOUSES}/${id}`));
};
