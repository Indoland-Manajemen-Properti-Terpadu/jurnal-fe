import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
  AdvanceUserRow,
  AuditEntityType,
  AuditEntry,
  ExpenseGroup,
  ExpenseSummaryReport,
  PendingVouchersReport,
  PeriodEndCheck,
  ReconciliationRow,
} from '@/module/petty-cash/domain/reports';
import type { Page } from '@/module/petty-cash/domain/pettyCashEntities';
import type { PettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';
import {
  getAdvancesByUserReport,
  getExpenseSummaryReport,
  getPendingVouchersReport,
  getPeriodEndCheck,
  getReconciliationReport,
  listAuditLog,
  listAuditLogs,
  type AuditLogParams,
} from '@/module/petty-cash/infrastructure/pettyCashReportApi';
import { pettyCashKeys } from '@/module/petty-cash/presentation/hooks/pettyCashKeys';
import { usePettyCashScope } from '@/module/petty-cash/presentation/hooks/usePettyCashScope';

export const usePendingVouchersReport = (fundId: string, asOf: string) => {
  const scope = usePettyCashScope();
  return useQuery<PendingVouchersReport, PettyCashError>({
    queryKey: pettyCashKeys.report(scope, 'pending', { fundId, asOf }),
    queryFn: () => getPendingVouchersReport(fundId, asOf),
  });
};

export const useExpenseSummaryReport = (params: {
  fundId: string;
  groupBy: ExpenseGroup;
  from?: string;
  to?: string;
}) => {
  const scope = usePettyCashScope();
  return useQuery<ExpenseSummaryReport, PettyCashError>({
    queryKey: pettyCashKeys.report(scope, 'expense', params),
    queryFn: () => getExpenseSummaryReport(params),
  });
};

export const useAdvancesByUserReport = (fundId: string) => {
  const scope = usePettyCashScope();
  return useQuery<AdvanceUserRow[], PettyCashError>({
    queryKey: pettyCashKeys.report(scope, 'advances', { fundId }),
    queryFn: () => getAdvancesByUserReport(fundId),
  });
};

export const useReconciliationReport = () => {
  const scope = usePettyCashScope();
  return useQuery<ReconciliationRow[], PettyCashError>({
    queryKey: pettyCashKeys.report(scope, 'reconciliation', {}),
    queryFn: getReconciliationReport,
  });
};

export const usePeriodEndCheck = (date: string) => {
  const scope = usePettyCashScope();
  return useQuery<PeriodEndCheck, PettyCashError>({
    queryKey: pettyCashKeys.report(scope, 'period-end', { date }),
    queryFn: () => getPeriodEndCheck(date),
    enabled: Boolean(date),
  });
};

export const useAuditLog = (entityType: AuditEntityType, entityId: string | undefined) => {
  const scope = usePettyCashScope();
  return useQuery<Page<AuditEntry>, PettyCashError>({
    queryKey: pettyCashKeys.audit(scope, entityType, entityId ?? ''),
    queryFn: () => listAuditLog(entityType, entityId as string),
    enabled: Boolean(entityId),
  });
};

export const useAuditLogs = (params: AuditLogParams) => {
  const scope = usePettyCashScope();
  return useQuery<Page<AuditEntry>, PettyCashError>({
    queryKey: pettyCashKeys.report(scope, 'audit-log', params),
    queryFn: () => listAuditLogs(params),
    placeholderData: keepPreviousData,
  });
};
