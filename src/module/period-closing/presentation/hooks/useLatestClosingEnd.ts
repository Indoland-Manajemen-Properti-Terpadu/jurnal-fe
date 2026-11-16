import { latestActiveClosing } from '@/module/period-closing/domain/periodRules';
import { useActivePeriods } from '@/module/period-closing/presentation/hooks/usePeriodQueries';

/**
 * The last day of the latest active closing, for screens outside this module that must not
 * date anything inside closed books. `undefined` while loading or when the books were never closed.
 */
export const useLatestClosingEnd = (enabled = true) => {
  const closings = useActivePeriods('CLOSE', enabled);
  return {
    endDate: latestActiveClosing(closings.data?.items ?? [])?.endDate,
    isLoading: closings.isLoading,
  };
};
