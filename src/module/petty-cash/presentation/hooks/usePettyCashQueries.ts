import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
  CashBook,
  Page,
  PettyCashFund,
  PettyCashLookups,
  PettyCashVoucherRecord,
} from '@/module/petty-cash/domain/pettyCashEntities';
import type { PettyCashAccessProfile } from '@/module/petty-cash/domain/pettyCashAccess';
import type { PettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';
import {
  getAccessProfile,
  getCashBook,
  getFund,
  getLookups,
  getVoucher,
  listFunds,
  listVouchers,
  type CashBookParams,
  type FundListParams,
  type VoucherListParams,
} from '@/module/petty-cash/infrastructure/pettyCashApi';
import { pettyCashKeys } from '@/module/petty-cash/presentation/hooks/pettyCashKeys';
import { usePettyCashScope } from '@/module/petty-cash/presentation/hooks/usePettyCashScope';

/** Rights change rarely within a session; lookups are a long list fetched once per form session. */
const STABLE_MS = 5 * 60 * 1000;

/** An unknown id is a 404 answer, not a transient failure worth retrying. */
const retryUnlessNotFound = (count: number, error: PettyCashError) =>
  error.code !== 'NOT_FOUND' && count < 2;

export const usePettyCashAccessProfile = () => {
  const scope = usePettyCashScope();
  return useQuery<PettyCashAccessProfile, PettyCashError>({
    queryKey: pettyCashKeys.access(scope),
    queryFn: getAccessProfile,
    staleTime: STABLE_MS,
  });
};

export const usePettyCashLookups = () => {
  const scope = usePettyCashScope();
  return useQuery<PettyCashLookups, PettyCashError>({
    queryKey: pettyCashKeys.lookups(scope),
    queryFn: getLookups,
    staleTime: STABLE_MS,
  });
};

export const usePettyCashFunds = (params: FundListParams = {}) => {
  const scope = usePettyCashScope();
  return useQuery<Page<PettyCashFund>, PettyCashError>({
    queryKey: pettyCashKeys.fundList(scope, params),
    queryFn: () => listFunds(params),
    placeholderData: keepPreviousData,
  });
};

export const usePettyCashFund = (fundId: string | undefined, enabled = true) => {
  const scope = usePettyCashScope();
  return useQuery<PettyCashFund, PettyCashError>({
    queryKey: pettyCashKeys.fund(scope, fundId ?? ''),
    queryFn: () => getFund(fundId as string),
    enabled: enabled && Boolean(fundId),
    retry: retryUnlessNotFound,
  });
};

export const usePettyCashCashBook = (fundId: string | undefined, params: CashBookParams = {}) => {
  const scope = usePettyCashScope();
  return useQuery<CashBook, PettyCashError>({
    queryKey: pettyCashKeys.cashBook(scope, fundId ?? '', params),
    queryFn: () => getCashBook(fundId as string, params),
    enabled: Boolean(fundId),
    placeholderData: keepPreviousData,
  });
};

export const usePettyCashVouchers = (params: VoucherListParams = {}) => {
  const scope = usePettyCashScope();
  return useQuery<Page<PettyCashVoucherRecord>, PettyCashError>({
    queryKey: pettyCashKeys.voucherList(scope, params),
    queryFn: () => listVouchers(params),
    placeholderData: keepPreviousData,
  });
};

export const usePettyCashVoucher = (voucherId: string | undefined) => {
  const scope = usePettyCashScope();
  return useQuery<PettyCashVoucherRecord, PettyCashError>({
    queryKey: pettyCashKeys.voucher(scope, voucherId ?? ''),
    queryFn: () => getVoucher(voucherId as string),
    enabled: Boolean(voucherId),
    retry: retryUnlessNotFound,
  });
};
