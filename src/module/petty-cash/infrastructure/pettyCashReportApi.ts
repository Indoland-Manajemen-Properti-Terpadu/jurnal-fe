import type {
  AdvanceUserRow,
  AgingBucket,
  AuditEntityType,
  AuditEntry,
  ExpenseGroup,
  ExpenseSummaryReport,
  PendingVouchersReport,
  PeriodEndCheck,
  ReconciliationRow,
} from '@/module/petty-cash/domain/reports';
import type { Page } from '@/module/petty-cash/domain/pettyCashEntities';
import type { ApiEnvelope, PageDto } from '@/module/petty-cash/infrastructure/pettyCashDto';
import { PETTY_CASH_API } from '@/module/petty-cash/infrastructure/pettyCashEndpoints';
import { http } from '@/module/petty-cash/infrastructure/pettyCashHttp';
import { toPage } from '@/module/petty-cash/infrastructure/pettyCashMappers';

interface FundRefDto {
  id: string;
  code: string;
  name: string;
}

export const getPendingVouchersReport = async (
  fundId?: string,
  asOf?: string
): Promise<PendingVouchersReport> => {
  const { data } = await http.get<
    ApiEnvelope<
      Omit<PendingVouchersReport, 'items'> & {
        items: Array<
          Omit<PendingVouchersReport['items'][number], 'fundCode'> & { fund: FundRefDto }
        >;
      }
    >
  >(PETTY_CASH_API.reportPendingVouchers, { fundId, asOf });
  return {
    ...data,
    items: data.items.map(({ fund, ...item }) => ({ ...item, fundCode: fund.code })),
  };
};

export const getExpenseSummaryReport = async (params: {
  fundId?: string;
  groupBy: ExpenseGroup;
  from?: string;
  to?: string;
}): Promise<ExpenseSummaryReport> => {
  const { data } = await http.get<ApiEnvelope<ExpenseSummaryReport>>(
    PETTY_CASH_API.reportExpenseSummary,
    params
  );
  return data;
};

export const getAdvancesByUserReport = async (fundId?: string): Promise<AdvanceUserRow[]> => {
  const { data } = await http.get<ApiEnvelope<AdvanceUserRow[]>>(
    PETTY_CASH_API.reportAdvancesByUser,
    { fundId }
  );
  return data;
};

interface ReconciliationDto extends Omit<ReconciliationRow, 'fund'> {
  fund: FundRefDto & { account: { accountNumber: string } };
}

export const getReconciliationReport = async (): Promise<ReconciliationRow[]> => {
  const { data } = await http.get<ApiEnvelope<ReconciliationDto[]>>(
    PETTY_CASH_API.reportReconciliation
  );
  return data.map(({ fund, ...row }) => ({
    ...row,
    fund: {
      id: fund.id,
      code: fund.code,
      name: fund.name,
      accountNumber: fund.account.accountNumber,
    },
  }));
};

export const getPeriodEndCheck = async (date: string): Promise<PeriodEndCheck> => {
  const { data } = await http.get<ApiEnvelope<PeriodEndCheck>>(PETTY_CASH_API.periodEndCheck, {
    date,
  });
  return data;
};

interface AuditDto {
  id: string;
  entityType: string;
  action: string;
  performedBy: { name: string } | null;
  reason: string | null;
  createdAt: string;
}

export interface AuditLogParams {
  entityType?: AuditEntityType;
  entityId?: string;
  action?: string;
  page?: number;
  limit?: number;
}

/** Newest first. Every filter is optional; the backend offers no date or user filter. */
export const listAuditLogs = async (params: AuditLogParams = {}): Promise<Page<AuditEntry>> => {
  const { data } = await http.get<ApiEnvelope<PageDto<AuditDto>>>(PETTY_CASH_API.auditLogs, {
    ...params,
  });
  return toPage(data, (item) => ({
    id: item.id,
    entityType: item.entityType,
    action: item.action,
    byName: item.performedBy?.name ?? '',
    reason: item.reason,
    createdAt: item.createdAt,
  }));
};

export const listAuditLog = (
  entityType: AuditEntityType,
  entityId: string,
  page = 1
): Promise<Page<AuditEntry>> => listAuditLogs({ entityType, entityId, page, limit: 50 });

export type { AgingBucket };
