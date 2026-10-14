import apiClient from '@/services/apiClient';
import type {
  AuditLogEntry,
  BalanceSheetSummary,
  BalanceSheetLine,
  PeriodInfo,
  SaleSummary,
} from '../domain/dashboardTypes';

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

type ApiEnvelope<T> = { code: number; message: string; data: T };

/* eslint-disable @typescript-eslint/no-explicit-any */
const toNumber = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

const mapLine = (dto: any): BalanceSheetLine => ({
  accountId: dto?.accountId ?? null,
  accountNumber: dto?.accountNumber ?? null,
  accountName: dto?.accountName ?? '—',
  categoryId: dto?.categoryId ?? '',
  categoryName: dto?.categoryName ?? '',
  balance: toNumber(dto?.balance),
});

const mapLines = (arr: unknown): BalanceSheetLine[] => (Array.isArray(arr) ? arr.map(mapLine) : []);

export const fetchBalanceSheet = async (endDate: string): Promise<BalanceSheetSummary> => {
  const { data } = await apiClient.get<ApiEnvelope<any>>(DASHBOARD_ENDPOINTS.balanceSheet, {
    params: { date: endDate, endDate },
  });
  const d = data.data ?? {};
  const assets = d.assets ?? {};
  return {
    endDate: d.endDate ?? endDate,
    currentAssets: mapLines(assets.currentAssets),
    nonCurrentAssets: mapLines(assets.nonCurrentAssets),
    liabilities: mapLines(d.liabilities),
    equity: mapLines(d.equity),
    totalCurrentAssets: toNumber(assets.totalCurrentAssets),
    totalNonCurrentAssets: toNumber(assets.totalNonCurrentAssets),
    totalDepreciation: toNumber(assets.totalDepreciationAmortization),
    totalAssets: toNumber(d.totalAssets),
    totalLiabilities: toNumber(d.totalLiabilities),
    totalEquity: toNumber(d.totalEquity),
  };
};

export const fetchRecentSales = async (limit = 100): Promise<{ items: SaleSummary[]; total: number }> => {
  const { data } = await apiClient.get<ApiEnvelope<any>>(DASHBOARD_ENDPOINTS.sales, {
    params: { page: 1, limit },
  });
  const raw = data.data ?? {};
  const list: any[] = Array.isArray(raw.data) ? raw.data : [];
  return {
    total: toNumber(raw.pagination?.total) || list.length,
    items: list.map((s) => ({
      id: s.id ?? s._id ?? '',
      transactionNumber: s.transactionNumber ?? '—',
      customerName: s.customer?.displayName ?? '—',
      transactionDate: s.transactionDate ?? null,
      dueDate: s.dueDate ?? null,
      status: String(s.status ?? 'DRAFT').toUpperCase(),
      finalAmount: toNumber(s.finalAmount ?? s.total),
      paidAmount: toNumber(s.paidAmount),
      remainingAmount: toNumber(s.remainingAmount),
    })),
  };
};

export const fetchPendingCount = async (): Promise<number> => {
  const { data } = await apiClient.get<ApiEnvelope<{ count?: number }>>(DASHBOARD_ENDPOINTS.pendingCount);
  return toNumber(data.data?.count);
};

export const fetchPeriods = async (): Promise<PeriodInfo[]> => {
  const { data } = await apiClient.get<ApiEnvelope<any>>(DASHBOARD_ENDPOINTS.periods);
  const list: any[] = Array.isArray(data.data?.results) ? data.data.results : [];
  return list.map((p) => ({
    id: p.id ?? '',
    name: p.name ?? '—',
    type: p.type ?? '',
    startDate: p.startDate ?? null,
    endDate: p.endDate ?? null,
    isActive: Boolean(p.isActive),
  }));
};

export const fetchAuditLogs = async (): Promise<AuditLogEntry[]> => {
  const { data } = await apiClient.get<ApiEnvelope<any>>(DASHBOARD_ENDPOINTS.auditLogs, {
    params: { page: 1 },
  });
  const list: any[] = Array.isArray(data.data?.results) ? data.data.results : [];
  return list.map((l) => ({
    id: l.id ?? '',
    action: String(l.action ?? '').toUpperCase(),
    transactionNumber: l.journal?.transactionNumber ?? l.snapshot?.transactionNumber ?? null,
    journalId: l.journal?.id ?? null,
    performedBy: l.performedBy?.name ?? '—',
    createdAt: l.createdAt ?? null,
  }));
};

export const fetchContactTotal = async (): Promise<number> => {
  const { data } = await apiClient.get<ApiEnvelope<any>>(DASHBOARD_ENDPOINTS.contacts, {
    params: { page: 1, limit: 1 },
  });
  return toNumber(data.data?.pagination?.total);
};

