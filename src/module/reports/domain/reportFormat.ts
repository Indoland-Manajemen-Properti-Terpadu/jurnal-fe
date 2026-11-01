import { endOfMonth, format, startOfMonth, startOfQuarter, startOfYear, subMonths } from 'date-fns';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const countFormatter = new Intl.NumberFormat('id-ID');

export const formatMoney = (value: number) => moneyFormatter.format(value ?? 0);
export const formatCount = (value: number) => countFormatter.format(value ?? 0);
export const dateOnly = (value: Date) => format(value, 'yyyy-MM-dd');

export function displayDate(value: string | undefined | null): string {
  if (!value) return '-';
  const datePart = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return value;
  return `${datePart.slice(8, 10)}/${datePart.slice(5, 7)}/${datePart.slice(0, 4)}`;
}

export type PeriodPreset = 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'custom';

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
    default:
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
  }
}
