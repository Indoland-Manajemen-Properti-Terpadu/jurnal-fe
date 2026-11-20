import { fromMinor } from '@/lib/money/money';

/**
 * Rounds a magnitude in minor units half up. The value is normalized to 15 significant digits
 * first so float noise (`1.005 * 100 = 100.49999999999999`) does not flip the result.
 */
export const roundMinor = (value: number): number => {
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

/** Rounds an amount to the cent: input boundary for anything typed or received as money. */
export const roundToCents = (amount: number): number => Number(fromMinor(toCents(amount)));

export const fromCents = (cents: number): number => Number(fromMinor(cents));

/**
 * What the invoice was issued for. After a return the server sends `finalAmount` net of it, and
 * the detail page lists the return as its own line, so the total must add it back to avoid
 * showing the same deduction twice.
 */
export const invoiceTotalBeforeReturns = (sale: {
  finalAmount: number;
  returnedAmount?: number;
}): number => fromCents(toCents(sale.finalAmount) + toCents(sale.returnedAmount ?? 0));
