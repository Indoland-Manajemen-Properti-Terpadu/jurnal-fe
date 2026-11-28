import type { NegativeNumberFormat } from '@/module/settings';
import { formatSignedAmountAt, formatSignedMoneyAt } from '@/utils/formatMoney';
import {
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
  subYears,
} from 'date-fns';

const countFormatter = new Intl.NumberFormat('id-ID');

/** Fixed digits of the report's `precision` (`Rp 1.500,00`); the figure itself comes from the API. */
export const formatMoney = (
  value: number,
  precision: number,
  negativeFormat?: NegativeNumberFormat
) => formatSignedMoneyAt(value, precision, negativeFormat);
export const formatAmount = (
  value: number,
  precision: number,
  negativeFormat?: NegativeNumberFormat
) => formatSignedAmountAt(value, precision, negativeFormat);
export const formatCount = (value: number) => countFormatter.format(value ?? 0);
export const dateOnly = (value: Date) => format(value, 'yyyy-MM-dd');

export function displayDate(value: string | undefined | null): string {
  if (!value) return '-';
  const datePart = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return value;
  return `${datePart.slice(8, 10)}/${datePart.slice(5, 7)}/${datePart.slice(0, 4)}`;
}

/** Long date used in report statements: `4 Nov 2026` in Indonesian. */
export function displayLongDate(value: string | undefined | null, language: string = 'id'): string {
  if (!value) return '-';
  const datePart = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return value;
  const date = new Date(`${datePart}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export type PeriodPreset =
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year'
  | 'last_year'
  | 'custom';

export function getPresetDateRange(preset: PeriodPreset): { startDate: string; endDate: string } {
  const today = new Date();
  switch (preset) {
    case 'this_month':
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
    case 'last_month': {
      const prevMonth = subMonths(today, 1);
      return {
        startDate: format(startOfMonth(prevMonth), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(prevMonth), 'yyyy-MM-dd'),
      };
    }
    case 'this_quarter':
      return {
        startDate: format(startOfQuarter(today), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
    case 'this_year':
      return {
        startDate: format(startOfYear(today), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
    case 'last_year': {
      const previousYear = subYears(today, 1);
      return {
        startDate: format(startOfYear(previousYear), 'yyyy-MM-dd'),
        endDate: format(endOfYear(previousYear), 'yyyy-MM-dd'),
      };
    }
    default:
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
  }
}

/** Share of `part` in `whole`, from 0 to 100; 0 when there is nothing to share. */
export const percentOf = (part: number, whole: number): number =>
  whole > 0 ? Math.min(100, Math.max(0, (part / whole) * 100)) : 0;
