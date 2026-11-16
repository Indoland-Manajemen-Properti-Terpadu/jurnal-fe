import { fromMinor, toMinor } from '@/lib/money/money';

/** The bank balance minus the book balance, cent-exact. A gap is normal: unrecorded items explain it. */
export const balanceGap = (
  statementBalance: number,
  bookBalance: number
): { amount: number; isZero: boolean } => {
  const minor = toMinor(statementBalance) - toMinor(bookBalance);
  return { amount: Number(fromMinor(minor)), isZero: minor === 0 };
};

export type Age = { unit: 'now' | 'minutes' | 'hours' | 'days'; value: number };

/** How long ago, in the largest sensible unit, for lines like "last synced 10 minutes ago". */
export const ageOf = (iso: string, now: Date = new Date()): Age => {
  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return { unit: 'now', value: 0 };
  if (seconds < 3600) return { unit: 'minutes', value: Math.floor(seconds / 60) };
  if (seconds < 86_400) return { unit: 'hours', value: Math.floor(seconds / 3600) };
  return { unit: 'days', value: Math.floor(seconds / 86_400) };
};
