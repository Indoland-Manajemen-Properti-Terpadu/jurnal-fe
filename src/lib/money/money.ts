/**
 * Money helpers. Amounts are handled as integer minor units (hundredths of the currency unit)
 * so debit/credit arithmetic never drifts. Convert once at the API boundary with `toMinor`,
 * calculate with plain integer math, and convert back with `fromMinor` for display or payloads.
 *
 * No rounding policy is invented here: input with more than two decimals is rejected, so the
 * rounding rule stays an explicit decision of the API contract.
 */

const DECIMAL_STRING = /^(-?)(\d+)(?:\.(\d{1,2}))?$/;
const FLOAT_TOLERANCE = 1e-6;
// A double near 1e11 hundredths is only exact to about 1e-5, so the tolerance must grow with
// magnitude or valid two-decimal amounts of a billion and above would be rejected.
const RELATIVE_TOLERANCE = Number.EPSILON * 4;

const assertSafeInteger = (value: number, input: unknown): number => {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`Amount out of range: ${String(input)}`);
  }
  return value === 0 ? 0 : value;
};

export function toMinor(amount: number | string): number {
  if (typeof amount === 'string') {
    const match = DECIMAL_STRING.exec(amount);
    if (!match) {
      throw new RangeError(`Invalid decimal amount: "${amount}"`);
    }
    const [, sign, whole, fraction = ''] = match;
    const minor = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    return assertSafeInteger(sign ? -minor : minor, amount);
  }

  if (!Number.isFinite(amount)) {
    throw new RangeError(`Invalid amount: ${String(amount)}`);
  }
  const scaled = amount * 100;
  const rounded = Math.round(scaled);
  const tolerance = Math.max(FLOAT_TOLERANCE, Math.abs(scaled) * RELATIVE_TOLERANCE);
  if (Math.abs(scaled - rounded) > tolerance) {
    throw new RangeError(`Amount has more than two decimal places: ${amount}`);
  }
  return assertSafeInteger(rounded, amount);
}

export function fromMinor(minor: number): string {
  if (!Number.isSafeInteger(minor)) {
    throw new RangeError(`Minor units must be an integer: ${String(minor)}`);
  }
  const absolute = Math.abs(minor);
  const whole = Math.floor(absolute / 100);
  const fraction = String(absolute % 100).padStart(2, '0');
  return `${minor < 0 ? '-' : ''}${whole}.${fraction}`;
}

export function sumMinor(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
