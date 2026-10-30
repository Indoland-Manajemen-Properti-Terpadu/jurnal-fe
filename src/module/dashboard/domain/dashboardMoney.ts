import { fromMinor, sumMinor } from '@/lib/money/money';

/**
 * Rounds a magnitude in minor units half up. The value is normalized to 15 significant digits
 * first so float noise (`1.005 * 100 = 100.49999999999999`) does not flip the result.
 */
const roundMinor = (value: number): number => {
  if (!Number.isFinite(value)) {
    throw new RangeError(`Invalid amount: ${String(value)}`);
  }
  const magnitude = Math.round(Number(Math.abs(value).toPrecision(15)));
  if (!Number.isSafeInteger(magnitude)) {
    throw new RangeError(`Amount out of range: ${String(value)}`);
  }
  return value < 0 && magnitude !== 0 ? -magnitude : magnitude;
};

/** An amount in currency units as integer cents, rounded half up (away from zero for negatives). */
export const toCents = (amount: number): number => roundMinor(amount * 100);

export const fromCents = (cents: number): number => Number(fromMinor(cents));

/** Rounds an amount to the cent: input boundary for every amount received from the API. */
export const roundToCents = (amount: number): number => fromCents(toCents(amount));

/** Sums amounts in integer cents so the total never drifts (`0.1 + 0.2` is exactly `0.3`). */
export const sumAmounts = (values: number[]): number => fromCents(sumMinor(values.map(toCents)));

/** `left - right` computed in integer cents. */
export const subtractAmounts = (left: number, right: number): number =>
  fromCents(toCents(left) - toCents(right));

/** Whether two amounts are the same to the cent. */
export const sameAmount = (left: number, right: number): boolean =>
  toCents(left) === toCents(right);
