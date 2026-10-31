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
  voucher: (scope: string, voucherId: string) =>
    [...pettyCashKeys.vouchers(scope), 'detail', voucherId] as const,
};
