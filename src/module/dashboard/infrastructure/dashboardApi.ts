import apiClient from '@/lib/http/apiClient';
import type {
  AuditLogEntry,
  BalanceSheetSummary,
  PeriodInfo,
  SaleSummary,
} from '../domain/dashboardTypes';
import type { ApiEnvelope, BalanceSheetDto, SalesPageDto } from './dashboardDto';
import {
  mapAuditLogs,
  mapBalanceSheet,
  mapPeriods,
  mapSale,
  mapSales,
  toNumber,
} from './dashboardMapper';

/**
 * Endpoints verified against `Jurnal Proapps.postman_collection.json`.
 */
export const DASHBOARD_ENDPOINTS = {
  balanceSheet: '/v1/reports/balance-sheet',
  sales: '/v1/sales',
  pendingCount: '/v1/pending-changes/count',
  periods: '/v1/accounting-periods',
  auditLogs: '/v1/journal/audit-logs',
  contacts: '/v1/contacts',
} as const;

export const fetchBalanceSheet = async (endDate: string): Promise<BalanceSheetSummary> => {
  const { data } = await apiClient.get<ApiEnvelope<BalanceSheetDto | null>>(
    DASHBOARD_ENDPOINTS.balanceSheet,
    { params: { date: endDate, endDate } }
  );
  return mapBalanceSheet(data.data ?? {}, endDate);
};

export const fetchRecentSales = async (
  limit = 100
): Promise<{ items: SaleSummary[]; total: number }> => {
  const { data } = await apiClient.get<ApiEnvelope<SalesPageDto | null>>(
    DASHBOARD_ENDPOINTS.sales,
    { params: { page: 1, limit } }
  );
  const raw = data.data ?? {};
  const list = mapSales(raw.data);
  return {
    total: toNumber(raw.pagination?.total) || list.length,
    items: list.map(mapSale),
  };
};

export const fetchPendingCount = async (): Promise<number> => {
  const { data } = await apiClient.get<ApiEnvelope<{ count?: number } | null>>(
    DASHBOARD_ENDPOINTS.pendingCount
  );
  return toNumber(data.data?.count);
};

export const fetchPeriods = async (): Promise<PeriodInfo[]> => {
  const { data } = await apiClient.get<ApiEnvelope<{ results?: unknown } | null>>(
    DASHBOARD_ENDPOINTS.periods
  );
  return mapPeriods(data.data?.results);
};

export const fetchAuditLogs = async (): Promise<AuditLogEntry[]> => {
  const { data } = await apiClient.get<ApiEnvelope<{ results?: unknown } | null>>(
    DASHBOARD_ENDPOINTS.auditLogs,
    { params: { page: 1 } }
  );
  return mapAuditLogs(data.data?.results);
};

export const fetchContactTotal = async (): Promise<number> => {
  const { data } = await apiClient.get<ApiEnvelope<{ pagination?: { total?: unknown } } | null>>(
    DASHBOARD_ENDPOINTS.contacts,
    { params: { page: 1, limit: 1 } }
  );
  return toNumber(data.data?.pagination?.total);
};
