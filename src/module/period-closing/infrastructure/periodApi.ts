import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import type {
  AccountingPeriod,
  DateLockCheck,
  PeriodCreateValues,
  PeriodListParams,
  PeriodPage,
  PeriodUpdateValues,
} from '@/module/period-closing/domain/accountingPeriod';
import type { ApiEnvelope, DateCheckDto, PeriodDto, PeriodListDto } from './periodDto';
import { mapDateCheck, mapPeriod, mapPeriodPage } from './periodMapper';

export const PERIOD_ENDPOINTS = {
  periods: '/v1/accounting-periods',
  period: (id: string) => `/v1/accounting-periods/${id}`,
  reopen: (id: string) => `/v1/accounting-periods/${id}/reopen`,
  check: '/v1/accounting-periods/check',
} as const;

/**
 * The most periods read at once when the status is filtered here. A site adds a handful of
 * periods a year, so this covers years of history.
 */
export const STATUS_FILTER_LIMIT = 100;

const requestPeriods = async (
  params: Omit<PeriodListParams, 'status'>
): Promise<PeriodListDto | undefined> =>
  (
    await apiClient.get<ApiEnvelope<PeriodListDto>>(PERIOD_ENDPOINTS.periods, {
      params: {
        type: params.type,
        sortBy: params.sortBy ?? 'startDate:desc',
        page: params.page,
        limit: params.limit,
      },
    })
  ).data.data;

/**
 * One page of periods. The server's `isActive` filter answers no rows for `true` and `false`
 * alike (checked 2026-11-12), so a status filter reads the periods of the type in one request
 * and filters and pages them here. Once the server filter works this can send `isActive` again.
 */
export const fetchPeriods = async (params: PeriodListParams): Promise<PeriodPage> => {
  if (!params.status) return mapPeriodPage(await requestPeriods(params), params.limit);

  const all = mapPeriodPage(
    await requestPeriods({ ...params, page: 1, limit: STATUS_FILTER_LIMIT }),
    STATUS_FILTER_LIMIT
  ).items.filter((period) => period.isActive === (params.status === 'active'));
  const start = (params.page - 1) * params.limit;
  return {
    items: all.slice(start, start + params.limit),
    pagination: {
      page: params.page,
      limit: params.limit,
      totalPages: Math.max(1, Math.ceil(all.length / params.limit)),
      total: all.length,
    },
  };
};

export const fetchPeriod = async (id: string): Promise<AccountingPeriod> => {
  const { data } = await apiClient.get<ApiEnvelope<PeriodDto>>(PERIOD_ENDPOINTS.period(id));
  return mapPeriod(data.data);
};

export const checkDateLocked = async (date: string): Promise<DateLockCheck> => {
  const { data } = await apiClient.get<ApiEnvelope<DateCheckDto>>(PERIOD_ENDPOINTS.check, {
    params: { date },
  });
  return mapDateCheck(data.data);
};

export const createPeriod = async (values: PeriodCreateValues): Promise<AccountingPeriod> => {
  const { data } = await apiClient.post<ApiEnvelope<PeriodDto>>(PERIOD_ENDPOINTS.periods, {
    name: values.name.trim(),
    type: values.type,
    startDate: values.startDate,
    endDate: values.endDate,
    notes: values.notes.trim() || undefined,
  });
  return mapPeriod(data.data);
};

/** Sends only what changes; a closing only ever gets `name` and `notes`. */
export const updatePeriod = async (
  id: string,
  values: PeriodUpdateValues
): Promise<AccountingPeriod> => {
  const { data } = await apiClient.patch<ApiEnvelope<PeriodDto>>(PERIOD_ENDPOINTS.period(id), {
    name: values.name.trim(),
    notes: values.notes.trim(),
    startDate: values.startDate,
    endDate: values.endDate,
    isActive: values.isActive,
  });
  return mapPeriod(data.data);
};

export const deletePeriod = async (id: string): Promise<void> => {
  await apiClient.delete(PERIOD_ENDPOINTS.period(id));
};

/** Voids the closing journal, lifts the lock and retires the latest closing, in one request. */
export const reopenPeriod = async (id: string): Promise<AccountingPeriod> => {
  const { data } = await apiClient.post<ApiEnvelope<PeriodDto>>(PERIOD_ENDPOINTS.reopen(id));
  return mapPeriod(data.data);
};

export interface PeriodRequestError {
  status: number | null;
  /** The server's message when it is meant for people (Indonesian), else empty. */
  message: string;
}

/**
 * Status and message of a failed request. Only 400 messages are shown as they are (the server
 * writes them in Indonesian for the user); other statuses get the screen's own wording, since the
 * server's text there is technical or English.
 */
export const readPeriodError = (error: unknown): PeriodRequestError => {
  if (!axios.isAxiosError(error)) return { status: null, message: '' };
  const status = error.response?.status ?? null;
  const raw = (error.response?.data as { message?: unknown } | undefined)?.message;
  const message = status === 400 && typeof raw === 'string' ? raw.trim() : '';
  return { status, message };
};
