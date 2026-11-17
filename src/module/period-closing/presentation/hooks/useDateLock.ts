import { useQuery } from '@tanstack/react-query';
import { checkDateLocked } from '@/module/period-closing/infrastructure/periodApi';

/**
 * Whether a calendar day (`YYYY-MM-DD`) lies in a locked period or a closed book, for forms outside
 * this module that must not post on it. While it loads, or if the check fails, the day counts as
 * open: the server still refuses the transaction, so a failed check never blocks the form.
 * The key sits under `accounting-period-check`, so any change of a period refreshes it.
 */
export const useDateLock = (date: string | null) => {
  const query = useQuery({
    queryKey: ['accounting-period-check', 'period', date],
    queryFn: () => checkDateLocked(date as string),
    enabled: Boolean(date),
  });
  const period = query.data?.isLocked ? query.data.period : null;
  return {
    isLocked: Boolean(query.data?.isLocked),
    /** Name of the period that locks the day (empty when the server did not say). */
    periodName: period?.name ?? '',
    periodType: period?.type ?? null,
    range: period ? { startDate: period.startDate, endDate: period.endDate } : null,
    isLoading: query.isLoading,
  };
};
