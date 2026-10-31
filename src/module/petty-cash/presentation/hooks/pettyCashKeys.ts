import type { CountListParams } from '@/module/petty-cash/infrastructure/pettyCashCountApi';
import type { ReimbursementListParams } from '@/module/petty-cash/infrastructure/pettyCashReplenishmentApi';
import type { AdvanceListParams } from '@/module/petty-cash/infrastructure/pettyCashAdvanceApi';
import type { ReplenishmentPreviewInput } from '@/module/petty-cash/domain/replenishment';
import type {
  CashBookParams,
  FundListParams,
  VoucherListParams,
} from '@/module/petty-cash/infrastructure/pettyCashApi';

/**
 * Every key starts with the signed-in user, so the cache of one user is never served to the next
 * user who signs in within the same session (the query client is never cleared on logout).
 */
export const pettyCashKeys = {
  all: (scope: string) => ['petty-cash', scope] as const,
  access: (scope: string) => [...pettyCashKeys.all(scope), 'access'] as const,
  lookups: (scope: string) => [...pettyCashKeys.all(scope), 'lookups'] as const,
  funds: (scope: string) => [...pettyCashKeys.all(scope), 'funds'] as const,
  fundList: (scope: string, params: FundListParams) =>
    [...pettyCashKeys.funds(scope), 'list', params] as const,
  fund: (scope: string, fundId: string) =>
    [...pettyCashKeys.funds(scope), 'detail', fundId] as const,
  cashBook: (scope: string, fundId: string, params: CashBookParams) =>
    [...pettyCashKeys.fund(scope, fundId), 'cash-book', params] as const,
  vouchers: (scope: string) => [...pettyCashKeys.all(scope), 'vouchers'] as const,
  voucherList: (scope: string, params: VoucherListParams) =>
    [...pettyCashKeys.vouchers(scope), 'list', params] as const,
  counts: (scope: string) => [...pettyCashKeys.all(scope), 'counts'] as const,
  countList: (scope: string, params: CountListParams) =>
    [...pettyCashKeys.counts(scope), 'list', params] as const,
  count: (scope: string, countId: string) =>
    [...pettyCashKeys.counts(scope), 'detail', countId] as const,
  reimbursements: (scope: string) => [...pettyCashKeys.all(scope), 'reimbursements'] as const,
  reimbursementList: (scope: string, params: ReimbursementListParams) =>
    [...pettyCashKeys.reimbursements(scope), 'list', params] as const,
  reimbursement: (scope: string, id: string) =>
    [...pettyCashKeys.reimbursements(scope), 'detail', id] as const,
  replenishmentPreview: (scope: string, input: ReplenishmentPreviewInput, date: string) =>
    // Outside the reimbursements key: a saved change refreshes those, not a throwaway preview.
    [...pettyCashKeys.all(scope), 'replenishment-preview', input, date] as const,
  advances: (scope: string) => [...pettyCashKeys.all(scope), 'advances'] as const,
  advanceList: (scope: string, params: AdvanceListParams) =>
    [...pettyCashKeys.advances(scope), 'list', params] as const,
  advance: (scope: string, id: string) => [...pettyCashKeys.advances(scope), 'detail', id] as const,
  advanceStatus: (scope: string, userId: string) =>
    [...pettyCashKeys.advances(scope), 'status', userId] as const,
  reports: (scope: string) => [...pettyCashKeys.all(scope), 'reports'] as const,
  report: (scope: string, name: string, params: unknown) =>
    [...pettyCashKeys.reports(scope), name, params] as const,
  auditAll: (scope: string) => [...pettyCashKeys.all(scope), 'audit'] as const,
  audit: (scope: string, entityType: string, entityId: string) =>
    [...pettyCashKeys.all(scope), 'audit', entityType, entityId] as const,
  voucher: (scope: string, voucherId: string) =>
    [...pettyCashKeys.vouchers(scope), 'detail', voucherId] as const,
};
