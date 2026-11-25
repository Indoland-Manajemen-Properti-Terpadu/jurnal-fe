import { isAxiosError } from 'axios';
import apiClient from '@/lib/http/apiClient';
import { toApiError } from '@/lib/http/apiError';
import type {
  JournalPreview,
  OpnameInput,
  OpnameLine,
  OpnameLineChange,
  OpnameListItem,
  OpnameReason,
  OpnameScope,
  OpnameStatus,
  OpnameSummary,
  OpnameWarehouse,
  StockOpname,
} from '@/module/inventory/domain/stockOpname';
import { NO_WAREHOUSE } from '@/module/inventory/domain/stockOpname';

const OPNAMES = '/v1/stock/opnames';

type Envelope<T> = { code?: number; message?: string; data: T };
type Person = { id?: string; name?: string } | null;

interface LineDto {
  id: string;
  productId: string;
  name: string;
  sku?: string | null;
  unit?: string | null;
  bookQty?: number | null;
  countedQty?: number | null;
  diffQty?: number | null;
  unitCost?: number | null;
  costEditable?: boolean;
  diffValue?: number | null;
  reason?: OpnameReason | null;
  allowedReasons?: OpnameReason[] | null;
  note?: string | null;
  isFound?: boolean;
  needsRecount?: boolean;
}

interface SummaryDto {
  counted?: number;
  total?: number;
  withDiff?: number;
  gainQty?: number;
  lossQty?: number;
  gainValue?: number | null;
  lossValue?: number | null;
  netValue?: number | null;
}

export interface OpnameDto {
  id: string;
  number: string;
  status: OpnameStatus;
  date: string;
  /** Null when the warehouse was deleted after the count was made. */
  warehouse: OpnameWarehouse | null;
  scope?: OpnameScope | null;
  notes?: string | null;
  counterUser?: Person;
  createdBy?: Person;
  createdAt?: string;
  startedAt?: string | null;
  postedAt?: string | null;
  approvedBy?: Person;
  canSeeValues?: boolean;
  progress?: { counted: number; total: number };
  lines?: LineDto[] | null;
  history?: { at: string; action: string; note?: string | null; user?: Person }[] | null;
  summary?: SummaryDto | null;
}

export interface OpnameItemDto {
  id: string;
  number: string;
  status: OpnameStatus;
  date: string;
  warehouse: OpnameWarehouse | null;
  progress?: { counted: number; total: number };
  createdBy?: Person;
  diffProducts?: number;
  diffValue?: number | null;
}

const toLine = (dto: LineDto): OpnameLine => ({
  id: dto.id,
  productId: dto.productId,
  name: dto.name,
  sku: dto.sku ?? '',
  unit: dto.unit ?? '',
  bookQty: dto.bookQty ?? null,
  countedQty: dto.countedQty ?? null,
  diffQty: dto.diffQty ?? null,
  unitCost: dto.unitCost ?? null,
  costEditable: dto.costEditable ?? false,
  diffValue: dto.diffValue ?? null,
  reason: dto.reason ?? null,
  allowedReasons: dto.allowedReasons ?? [],
  note: dto.note ?? '',
  isFound: dto.isFound ?? false,
  needsRecount: dto.needsRecount ?? false,
});

const toSummary = (dto: SummaryDto | null | undefined): OpnameSummary => ({
  counted: dto?.counted ?? 0,
  total: dto?.total ?? 0,
  withDiff: dto?.withDiff ?? 0,
  gainQty: dto?.gainQty ?? 0,
  lossQty: dto?.lossQty ?? 0,
  gainValue: dto?.gainValue ?? null,
  lossValue: dto?.lossValue ?? null,
  netValue: dto?.netValue ?? null,
});

export const toOpname = (dto: OpnameDto): StockOpname => ({
  id: dto.id,
  number: dto.number,
  status: dto.status,
  date: dto.date,
  warehouse: dto.warehouse ?? NO_WAREHOUSE,
  scope: dto.scope ?? { type: 'all', categoryIds: [], productIds: [] },
  counterName: dto.counterUser?.name ?? null,
  counterId: dto.counterUser?.id ?? null,
  createdByName: dto.createdBy?.name ?? '',
  createdAt: dto.createdAt ?? '',
  startedAt: dto.startedAt ?? null,
  postedAt: dto.postedAt ?? null,
  approvedByName: dto.approvedBy?.name ?? null,
  notes: dto.notes ?? '',
  canSeeValues: dto.canSeeValues ?? false,
  lines: (dto.lines ?? []).map(toLine),
  history: (dto.history ?? []).map((entry) => ({
    at: entry.at,
    action: entry.action,
    note: entry.note ?? '',
    userName: entry.user?.name ?? '',
  })),
  summary: toSummary(dto.summary),
});

export const toOpnameItem = (dto: OpnameItemDto): OpnameListItem => ({
  id: dto.id,
  number: dto.number,
  status: dto.status,
  date: dto.date,
  warehouse: dto.warehouse ?? NO_WAREHOUSE,
  counted: dto.progress?.counted ?? 0,
  total: dto.progress?.total ?? 0,
  diffProducts: dto.diffProducts ?? 0,
  diffValue: dto.diffValue ?? null,
  createdByName: dto.createdBy?.name ?? '',
});

export interface OpnameListParams {
  q?: string;
  warehouse?: string;
  /** One status, or several (the service accepts `status` repeated). */
  status?: OpnameStatus | OpnameStatus[];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const toOpnameQuery = (
  params: OpnameListParams
): Record<string, string | string[] | number | boolean> => {
  const query: Record<string, string | string[] | number | boolean> = {};
  const q = params.q?.trim();
  if (q) query.q = q;
  if (params.warehouse) query.warehouse = params.warehouse;
  if (Array.isArray(params.status)) {
    if (params.status.length > 0) query.status = params.status;
  } else if (params.status) {
    query.status = params.status;
  }
  if (params.startDate) query.startDate = params.startDate;
  if (params.endDate) query.endDate = params.endDate;
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  return query;
};

/** The service names the warehouse `warehouse`; empty optional fields are left out. */
export const toCreateOpnameBody = (input: OpnameInput) => {
  const notes = input.notes.trim();
  return {
    warehouse: input.warehouse,
    date: input.date,
    scope: input.scope,
    ...(input.counterUser ? { counterUser: input.counterUser } : {}),
    ...(notes ? { notes } : {}),
  };
};

export const toLineBody = (change: OpnameLineChange) => {
  const { note, ...rest } = change;
  return { ...rest, ...(note === undefined ? {} : { note: note.trim() }) };
};

export const toJournalPreview = (dto: {
  entries?: {
    account?: string;
    accountNumber: string;
    accountName: string;
    reasons?: OpnameReason[];
    count?: number;
    debit?: number;
    credit?: number;
  }[];
  missing?: OpnameReason[];
}): JournalPreview => ({
  entries: (dto.entries ?? []).map((entry) => ({
    accountId: entry.account ?? '',
    accountNumber: entry.accountNumber,
    accountName: entry.accountName,
    reasons: entry.reasons ?? [],
    count: entry.count ?? 0,
    debit: entry.debit ?? 0,
    credit: entry.credit ?? 0,
  })),
  missing: dto.missing ?? [],
});

export const toAccountsBody = (accounts: Record<string, string>) => ({ accounts });

export interface OpnamePage {
  items: OpnameListItem[];
  page: number;
  totalPages: number;
  totalResults: number;
  canSeeValues: boolean;
  summary: { running: number; pending: number; diffThisMonth: number | null };
}

const call = async <T>(request: () => Promise<{ data: T }>): Promise<T> => {
  try {
    return (await request()).data;
  } catch (error) {
    throw toApiError(error);
  }
};

export const listOpnames = async (params: OpnameListParams = {}): Promise<OpnamePage> => {
  const body = await call(() =>
    apiClient.get<
      Envelope<{
        results?: OpnameItemDto[];
        page?: number;
        totalPages?: number;
        totalResults?: number;
        canSeeValues?: boolean;
        summary?: { running?: number; pending?: number; diffThisMonth?: number | null };
      }>
    >(OPNAMES, {
      params: toOpnameQuery(params),
      // `status=counting&status=pending_approval`, not `status[]=...`.
      paramsSerializer: { indexes: null },
    })
  );
  const { data } = body;
  return {
    items: (data.results ?? []).map(toOpnameItem),
    page: data.page ?? 1,
    totalPages: data.totalPages ?? 0,
    totalResults: data.totalResults ?? 0,
    canSeeValues: data.canSeeValues ?? false,
    summary: {
      running: data.summary?.running ?? 0,
      pending: data.summary?.pending ?? 0,
      diffThisMonth: data.summary?.diffThisMonth ?? null,
    },
  };
};

export const getOpname = async (id: string): Promise<StockOpname> => {
  const body = await call(() => apiClient.get<Envelope<OpnameDto>>(`${OPNAMES}/${id}`));
  return toOpname(body.data);
};

export const createOpname = async (input: OpnameInput): Promise<StockOpname> => {
  const body = await call(() =>
    apiClient.post<Envelope<OpnameDto>>(OPNAMES, toCreateOpnameBody(input))
  );
  return toOpname(body.data);
};

export const updateOpnameHeader = async (
  id: string,
  input: Omit<OpnameInput, 'warehouse'>
): Promise<StockOpname> => {
  const { date, scope, counterUser, notes } = input;
  const body = await call(() =>
    apiClient.put<Envelope<OpnameDto>>(`${OPNAMES}/${id}`, {
      date,
      scope,
      counterUser: counterUser || null,
      notes: notes.trim(),
    })
  );
  return toOpname(body.data);
};

export const saveOpnameLines = async (
  id: string,
  changes: OpnameLineChange[]
): Promise<StockOpname> => {
  const body = await call(() =>
    apiClient.put<Envelope<OpnameDto>>(`${OPNAMES}/${id}`, { lines: changes.map(toLineBody) })
  );
  return toOpname(body.data);
};

export type OpnameStep = 'start' | 'submit' | 'approve' | 'reject' | 'cancel';

/** Moves a count along; reject and cancel carry the reason that is kept in its history. */
export const stepOpname = async (
  id: string,
  step: OpnameStep,
  reason?: string
): Promise<StockOpname> => {
  const payload = reason === undefined ? undefined : { reason: reason.trim() };
  const body = await call(() =>
    apiClient.post<Envelope<OpnameDto>>(`${OPNAMES}/${id}/${step}`, payload)
  );
  return toOpname(body.data);
};

export const getJournalPreview = async (id: string): Promise<JournalPreview> => {
  const body = await call(() =>
    apiClient.get<Envelope<Parameters<typeof toJournalPreview>[0]>>(
      `${OPNAMES}/${id}/journal-preview`
    )
  );
  return toJournalPreview(body.data);
};

/** The count in progress for a warehouse, if any: while it runs the warehouse is frozen. */
export const getRunningOpname = async (
  warehouseId: string
): Promise<{ id: string; number: string } | null> => {
  const body = await call(() =>
    apiClient.get<Envelope<{ id: string; number: string } | null>>(`${OPNAMES}/running`, {
      params: { warehouseId },
    })
  );
  return body.data ? { id: body.data.id, number: body.data.number } : null;
};

/** Deletes a draft count; the service refuses (400) once it was started, which is cancelled instead. */
export const deleteOpname = async (id: string): Promise<void> => {
  await call(() => apiClient.delete(`${OPNAMES}/${id}`));
};

const readText = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });

/**
 * The minutes (berita acara) of a posted count as a PDF made by the server, so its figures and the
 * company profile match the ledger. Only reviewers and approvers may ask for it (403 otherwise), and
 * only once the count is posted (400 otherwise). An error body arrives as a blob and is read first.
 */
export const downloadOpnameMinutes = async (id: string): Promise<Blob> => {
  try {
    return (await apiClient.get<Blob>(`${OPNAMES}/${id}/print`, { responseType: 'blob' })).data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data instanceof Blob) {
      const text = await readText(error.response.data);
      try {
        error.response.data = JSON.parse(text);
      } catch {
        error.response.data = {};
      }
    }
    throw toApiError(error);
  }
};
