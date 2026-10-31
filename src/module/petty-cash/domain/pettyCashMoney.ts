import { fromMinor, sumMinor } from '@/lib/money/money';

/** Rounds one amount half up to the cent; a missing or non-finite amount counts as zero. */
export const toCents = (value: unknown): number => {
  const amount = typeof value === 'string' ? Number(value) : value;
  return typeof amount === 'number' && Number.isFinite(amount)
    ? Math.round(Number((amount * 100).toPrecision(15)))
    : 0;
};

const toAmount = (cents: number): number => Number(fromMinor(cents));

export const sumAmounts = (values: unknown[]): number => toAmount(sumMinor(values.map(toCents)));

export const addAmounts = (a: number, b: number): number => toAmount(toCents(a) + toCents(b));

export const subtractAmounts = (a: number, b: number): number => toAmount(toCents(a) - toCents(b));

/** Negative when `a` is below `b`, zero when they are equal to the cent. */
export const compareAmounts = (a: number, b: number): number => toCents(a) - toCents(b);
