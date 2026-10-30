import { useQuery } from '@tanstack/react-query';
import {
  fetchAuditLogs,
  fetchBalanceSheet,
  fetchContactTotal,
  fetchPendingCount,
  fetchPeriods,
  fetchRecentSales,
} from '@/module/dashboard/infrastructure/dashboardApi';

const todayIso = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

export const dashboardKeys = {
  all: ['dashboard'] as const,
  balanceSheet: (date: string) => [...dashboardKeys.all, 'balance-sheet', date] as const,
  sales: () => [...dashboardKeys.all, 'sales'] as const,
  pending: () => [...dashboardKeys.all, 'pending-count'] as const,
  periods: () => [...dashboardKeys.all, 'periods'] as const,
  audit: () => [...dashboardKeys.all, 'audit-logs'] as const,
  contacts: () => [...dashboardKeys.all, 'contact-total'] as const,
};

const STALE = 60_000;

export const useBalanceSheetSummary = () => {
  const date = todayIso();
  return useQuery({ queryKey: dashboardKeys.balanceSheet(date), queryFn: () => fetchBalanceSheet(date), staleTime: STALE });
};

export const useRecentSales = () =>
  useQuery({ queryKey: dashboardKeys.sales(), queryFn: () => fetchRecentSales(100), staleTime: STALE });

/** Exposed publicly so the app header can show the approval badge. */
export const usePendingChangesCount = () =>
  useQuery({ queryKey: dashboardKeys.pending(), queryFn: fetchPendingCount, staleTime: STALE, retry: 1 });

export const useAccountingPeriods = () =>
  useQuery({ queryKey: dashboardKeys.periods(), queryFn: fetchPeriods, staleTime: STALE });

export const useJournalAuditLogs = () =>
  useQuery({ queryKey: dashboardKeys.audit(), queryFn: fetchAuditLogs, staleTime: STALE });

export const useContactTotal = () =>
  useQuery({ queryKey: dashboardKeys.contacts(), queryFn: fetchContactTotal, staleTime: STALE });

