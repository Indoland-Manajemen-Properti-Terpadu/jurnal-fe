import type { AccountingPeriod, PeriodCreateValues, PeriodType } from './accountingPeriod';

/**
 * Pure date and permission rules of accounting periods. Dates are calendar days (`YYYY-MM-DD`)
 * compared as strings and shifted in UTC, so no time zone can move a day.
 */

export interface DateRange {
  startDate: string;
  endDate: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export const isCalendarDay = (value: string): boolean => ISO_DAY.test(value);

const toUtc = (day: string): number => {
  const [year, month, date] = day.split('-').map(Number);
  return Date.UTC(year, month - 1, date);
};

const fromUtc = (time: number): string => new Date(time).toISOString().slice(0, 10);

export const addDays = (day: string, amount: number): string =>
  fromUtc(toUtc(day) + amount * DAY_MS);

/** Number of days in a range, both ends included. */
export const countDays = ({ startDate, endDate }: DateRange): number =>
  Math.round((toUtc(endDate) - toUtc(startDate)) / DAY_MS) + 1;

const lastDayOfMonth = (year: number, month: number): string => fromUtc(Date.UTC(year, month, 0));

const pad = (value: number) => String(value).padStart(2, '0');

export const rangesOverlap = (a: DateRange, b: DateRange): boolean =>
  a.startDate <= b.endDate && b.startDate <= a.endDate;

/**
 * The active period of the same type that a range would collide with. The server checks the same
 * rule (LOCK against LOCK, CLOSE against CLOSE) and answers 409; checking here lets the form say so
 * before saving.
 */
export const findOverlap = (
  range: DateRange,
  type: PeriodType,
  periods: readonly AccountingPeriod[],
  excludeId?: string
): AccountingPeriod | undefined =>
  periods.find(
    (period) =>
      period.isActive &&
      period.type === type &&
      period.id !== excludeId &&
      rangesOverlap(range, period)
  );

/** The active closing with the latest end date: the only one that can be reopened. */
export const latestActiveClosing = (
  periods: readonly AccountingPeriod[]
): AccountingPeriod | undefined =>
  periods
    .filter((period) => period.type === 'CLOSE' && period.isActive)
    .reduce<
      AccountingPeriod | undefined
    >((latest, period) => (!latest || period.endDate > latest.endDate ? period : latest), undefined);

export const canDeletePeriod = (period: AccountingPeriod): boolean => period.type === 'LOCK';

/** A closing changes only its name and notes; a lock changes everything except its type. */
export const canEditDates = (period: AccountingPeriod): boolean => period.type === 'LOCK';

export const canReopenPeriod = (
  period: AccountingPeriod,
  latestClosing: AccountingPeriod | undefined
): boolean => period.type === 'CLOSE' && period.isActive && latestClosing?.id === period.id;

/** Whether a calendar day falls inside a range. */
export const isWithin = (day: string, range: DateRange): boolean =>
  day >= range.startDate && day <= range.endDate;

/**
 * Days left uncovered between the latest closing and a new one. Closings do not have to follow each
 * other, but a gap leaves transactions that no closing locks.
 */
export const gapAfterLatestClosing = (
  startDate: string,
  latestClosing: AccountingPeriod | undefined
): number => {
  if (!latestClosing || !isCalendarDay(startDate)) return 0;
  const expected = addDays(latestClosing.endDate, 1);
  return startDate > expected
    ? countDays({ startDate: expected, endDate: addDays(startDate, -1) })
    : 0;
};

/**
 * Suggested range for the next closing. It starts the day after the latest closing (or on the first
 * day of last year when there is none) and runs to the end of that year; a year that has not ended
 * yet is cut back to the end of last month. Returns only a start date when no whole month is over.
 */
export const suggestClosingRange = (
  latestClosing: AccountingPeriod | undefined,
  today: string
): DateRange => {
  const thisYear = Number(today.slice(0, 4));
  const startDate = latestClosing ? addDays(latestClosing.endDate, 1) : `${thisYear - 1}-01-01`;
  const yearEnd = `${startDate.slice(0, 4)}-12-31`;
  if (yearEnd < today) return { startDate, endDate: yearEnd };

  const [year, month] = today.split('-').map(Number);
  const previousMonthEnd = lastDayOfMonth(year, month - 1);
  return { startDate, endDate: previousMonthEnd >= startDate ? previousMonthEnd : '' };
};

export type LockPreset = 'lastMonth' | 'lastQuarter' | 'lastYear' | 'thisMonth';

export const LOCK_PRESETS: readonly LockPreset[] = [
  'lastMonth',
  'lastQuarter',
  'lastYear',
  'thisMonth',
];

/** Ready-made ranges for a lock, relative to today. */
export const lockPresetRange = (preset: LockPreset, today: string): DateRange => {
  const [year, month] = today.split('-').map(Number);
  switch (preset) {
    case 'thisMonth':
      return { startDate: `${year}-${pad(month)}-01`, endDate: lastDayOfMonth(year, month) };
    case 'lastMonth': {
      const prevYear = month === 1 ? year - 1 : year;
      const prevMonth = month === 1 ? 12 : month - 1;
      return {
        startDate: `${prevYear}-${pad(prevMonth)}-01`,
        endDate: lastDayOfMonth(prevYear, prevMonth),
      };
    }
    case 'lastQuarter': {
      const quarter = Math.floor((month - 1) / 3);
      const prevQuarter = quarter === 0 ? 3 : quarter - 1;
      const quarterYear = quarter === 0 ? year - 1 : year;
      const firstMonth = prevQuarter * 3 + 1;
      return {
        startDate: `${quarterYear}-${pad(firstMonth)}-01`,
        endDate: lastDayOfMonth(quarterYear, firstMonth + 2),
      };
    }
    case 'lastYear':
    default:
      return { startDate: `${year - 1}-01-01`, endDate: `${year - 1}-12-31` };
  }
};

/** What a range covers, so a name can be suggested: a whole year, quarter, month, or anything else. */
export type RangeShape =
  | { kind: 'year'; year: number }
  | { kind: 'quarter'; year: number; quarter: number }
  | { kind: 'month'; year: number; month: number }
  | { kind: 'custom' };

export const describeRange = ({ startDate, endDate }: DateRange): RangeShape => {
  if (!isCalendarDay(startDate) || !isCalendarDay(endDate)) return { kind: 'custom' };
  const [year, month, day] = startDate.split('-').map(Number);
  if (day !== 1) return { kind: 'custom' };
  if (month === 1 && endDate === `${year}-12-31`) return { kind: 'year', year };
  if (endDate === lastDayOfMonth(year, month)) return { kind: 'month', year, month };
  if ((month - 1) % 3 === 0 && endDate === lastDayOfMonth(year, month + 2)) {
    return { kind: 'quarter', year, quarter: (month - 1) / 3 + 1 };
  }
  return { kind: 'custom' };
};

export type PeriodFormError = 'nameRequired' | 'startRequired' | 'endRequired' | 'endBeforeStart';

export type PeriodFormErrors = Partial<Record<'name' | 'startDate' | 'endDate', PeriodFormError>>;

export const validatePeriodValues = (
  values: Pick<PeriodCreateValues, 'name' | 'startDate' | 'endDate'>
): PeriodFormErrors => {
  const errors: PeriodFormErrors = {};
  if (!values.name.trim()) errors.name = 'nameRequired';
  if (!isCalendarDay(values.startDate)) errors.startDate = 'startRequired';
  if (!isCalendarDay(values.endDate)) errors.endDate = 'endRequired';
  if (!errors.startDate && !errors.endDate && values.endDate < values.startDate) {
    errors.endDate = 'endBeforeStart';
  }
  return errors;
};
