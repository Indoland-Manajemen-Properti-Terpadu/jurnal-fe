import type { DateRange } from './saleListState';

export const DATE_PRESETS = ['all', 'today', 'week', 'month', 'year', 'custom'] as const;
export type DatePreset = (typeof DATE_PRESETS)[number];

/** A dashboard month key to the exact calendar range accepted by the list API. */
export const monthRangeFromKey = (key: string | null): DateRange | null => {
  if (!key || !/^\d{4}-(0[1-9]|1[0-2])$/.test(key)) return null;
  const [year, month] = key.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return [`${key}-01`, `${key}-${String(lastDay).padStart(2, '0')}`];
};

const iso = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/**
 * The dates a preset stands for, in local time: today, this week (Monday to Sunday, as the
 * calendar here runs), this month and this year. "Semua" and "Kustom" have no range of their own.
 */
export const presetRange = (preset: DatePreset, now: Date = new Date()): DateRange => {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  switch (preset) {
    case 'today':
      return [iso(now), iso(now)];
    case 'week': {
      const sinceMonday = (now.getDay() + 6) % 7;
      return [iso(new Date(y, m, d - sinceMonday)), iso(new Date(y, m, d - sinceMonday + 6))];
    }
    case 'month':
      return [iso(new Date(y, m, 1)), iso(new Date(y, m + 1, 0))];
    case 'year':
      return [iso(new Date(y, 0, 1)), iso(new Date(y, 11, 31))];
    default:
      return [null, null];
  }
};
