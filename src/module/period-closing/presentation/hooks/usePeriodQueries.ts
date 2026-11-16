import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import type {
  AccountingPeriod,
  PeriodCreateValues,
  PeriodListParams,
  PeriodType,
  PeriodUpdateValues,
} from '@/module/period-closing/domain/accountingPeriod';
import type { DateRange } from '@/module/period-closing/domain/periodRules';
import { fetchClosingTrialBalance } from '@/module/period-closing/infrastructure/closingSourcesApi';
import {
  createPeriod,
  deletePeriod,
  fetchPeriods,
  readPeriodError,
  reopenPeriod,
  updatePeriod,
} from '@/module/period-closing/infrastructure/periodApi';

/** Enough to hold every active period of one type for the overlap check and the summary. */
const ACTIVE_LIMIT = 100;

export const periodKeys = {
  all: ['accounting-periods'] as const,
  list: (params: PeriodListParams) => ['accounting-periods', 'list', params] as const,
  active: (type: PeriodType) => ['accounting-periods', 'active', type] as const,
  // Same key as the trial balance report, so both screens share one cached answer.
  trialBalance: (range: DateRange) => ['trial-balance', range.startDate, range.endDate] as const,
};

/** Key prefixes other screens use for data a period changes (date checks, reports, journals). */
const AFFECTED_KEYS = [
  ['accounting-period-check'],
  ['trial-balance'],
  ['balance-sheet-report'],
  ['profit-loss'],
  ['general-ledger'],
  ['equity_change_report'],
  ['journal_history'],
  ['transaction_by_account'],
] as const;

const tr = (key: string, params?: Record<string, string | number>) =>
  t(key, params, 'periodClosing');

/** A message people can act on; the server's own text only when it is written for them (400). */
export const periodErrorText = (error: unknown, fallbackKey: string): string => {
  const { status, message } = readPeriodError(error);
  if (status === 400 && message) return message;
  if (status === 403) return tr('errors.forbidden');
  if (status === 404) return tr('errors.notFound');
  if (status === 409) return tr('errors.overlap');
  return tr(fallbackKey);
};

/** The server refused because the user lacks the period menu. */
export const isForbiddenError = (error: unknown): boolean => readPeriodError(error).status === 403;

const notifyError = (error: unknown, fallbackKey: string) =>
  notifications.show({
    color: 'red',
    title: tr('errors.title'),
    message: periodErrorText(error, fallbackKey),
  });

const notifySuccess = (title: string, message: string) =>
  notifications.show({ color: 'teal', title, message });

export const usePeriods = (params: PeriodListParams, enabled = true) =>
  useQuery({
    queryKey: periodKeys.list(params),
    queryFn: () => fetchPeriods(params),
    placeholderData: keepPreviousData,
    enabled,
  });

/** Every active period of a type, latest end date first. */
export const useActivePeriods = (type: PeriodType, enabled = true) =>
  useQuery({
    queryKey: periodKeys.active(type),
    queryFn: () =>
      fetchPeriods({
        type,
        status: 'active',
        page: 1,
        limit: ACTIVE_LIMIT,
        sortBy: 'endDate:desc',
      }),
    enabled,
  });

export const useClosingTrialBalance = (range: DateRange | null) =>
  useQuery({
    queryKey: periodKeys.trialBalance(range ?? { startDate: '', endDate: '' }),
    queryFn: ({ signal }) =>
      fetchClosingTrialBalance(range as DateRange, tr('errors.reportFailed'), signal),
    enabled: Boolean(range?.startDate && range.endDate),
  });

const useInvalidatePeriods = () => {
  const queryClient = useQueryClient();
  return (withLedger: boolean) => {
    queryClient.invalidateQueries({ queryKey: periodKeys.all });
    AFFECTED_KEYS.slice(0, withLedger ? AFFECTED_KEYS.length : 1).forEach((queryKey) =>
      queryClient.invalidateQueries({ queryKey })
    );
  };
};

/** A failed write on a period that no longer exists leaves a stale list behind; reload it. */
const useRefreshOnMissing = () => {
  const queryClient = useQueryClient();
  return (error: unknown) => {
    if (readPeriodError(error).status === 404) {
      queryClient.invalidateQueries({ queryKey: periodKeys.all });
    }
  };
};

export const useCreatePeriod = () => {
  const invalidate = useInvalidatePeriods();
  return useMutation({
    mutationFn: (values: PeriodCreateValues) => createPeriod(values),
    onSuccess: (period) => {
      invalidate(period.type === 'CLOSE');
      if (period.type === 'LOCK') {
        notifySuccess(tr('notify.lockedTitle'), tr('notify.locked', { name: period.name }));
      }
    },
    onError: (error) => notifyError(error, 'errors.saveFailed'),
  });
};

export const useUpdatePeriod = () => {
  const invalidate = useInvalidatePeriods();
  const refresh = useRefreshOnMissing();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: PeriodUpdateValues }) =>
      updatePeriod(id, values),
    onSuccess: (period) => {
      invalidate(false);
      notifySuccess(tr('notify.savedTitle'), tr('notify.saved', { name: period.name }));
    },
    onError: (error) => {
      refresh(error);
      notifyError(error, 'errors.saveFailed');
    },
  });
};

/** Turns a lock on or off without opening the form. */
export const useToggleLock = () => {
  const invalidate = useInvalidatePeriods();
  const refresh = useRefreshOnMissing();
  return useMutation({
    mutationFn: (period: AccountingPeriod) =>
      updatePeriod(period.id, {
        name: period.name,
        notes: period.notes,
        isActive: !period.isActive,
      }),
    onSuccess: (period) => {
      invalidate(false);
      notifySuccess(
        tr('notify.savedTitle'),
        tr(period.isActive ? 'notify.lockOn' : 'notify.lockOff', { name: period.name })
      );
    },
    onError: (error) => {
      refresh(error);
      notifyError(error, 'errors.saveFailed');
    },
  });
};

export const useDeletePeriod = () => {
  const invalidate = useInvalidatePeriods();
  const refresh = useRefreshOnMissing();
  return useMutation({
    mutationFn: (period: AccountingPeriod) => deletePeriod(period.id).then(() => period),
    onSuccess: (period) => {
      invalidate(false);
      notifySuccess(tr('notify.deletedTitle'), tr('notify.deleted', { name: period.name }));
    },
    onError: (error) => {
      refresh(error);
      notifyError(error, 'errors.deleteFailed');
    },
  });
};

export const useReopenPeriod = () => {
  const invalidate = useInvalidatePeriods();
  const refresh = useRefreshOnMissing();
  return useMutation({
    mutationFn: (period: AccountingPeriod) => reopenPeriod(period.id).then(() => period),
    onSuccess: (period) => {
      invalidate(true);
      notifySuccess(tr('notify.reopenedTitle'), tr('notify.reopened', { name: period.name }));
    },
    onError: (error) => {
      refresh(error);
      notifyError(error, 'errors.reopenFailed');
    },
  });
};
