import { differenceInCalendarDays, format, parseISO, subDays, subYears } from 'date-fns';
import type { ReportPeriod } from './generalLedger.types';

export type ProfitLossComparisonPreset =
  | 'none'
  | 'previous_period'
  | 'same_period_last_year'
  | 'custom';

const asDate = (value: string) => parseISO(value);
const asDateOnly = (value: Date) => format(value, 'yyyy-MM-dd');

/** The date range sent as the optional comparison to the profit and loss endpoint. */
export const getProfitLossComparisonRange = (
  preset: ProfitLossComparisonPreset,
  period: ReportPeriod,
  custom: ReportPeriod
): ReportPeriod | null => {
  if (preset === 'none') return null;
  if (preset === 'custom') {
    return custom.startDate && custom.endDate && custom.startDate <= custom.endDate ? custom : null;
  }

  const start = asDate(period.startDate);
  const end = asDate(period.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return null;

  if (preset === 'same_period_last_year') {
    return {
      startDate: asDateOnly(subYears(start, 1)),
      endDate: asDateOnly(subYears(end, 1)),
    };
  }

  const compareEnd = subDays(start, 1);
  const length = differenceInCalendarDays(end, start) + 1;
  return {
    startDate: asDateOnly(subDays(compareEnd, length - 1)),
    endDate: asDateOnly(compareEnd),
  };
};
