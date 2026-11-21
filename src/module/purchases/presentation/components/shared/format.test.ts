import { afterEach, describe, expect, it } from 'vitest';
import {
  formatAmount,
  setAmountPrecision,
} from '@/module/purchases/presentation/components/shared/format';

describe('formatAmount precision', () => {
  afterEach(() => setAmountPrecision(2));

  it('follows the precision of the general settings', () => {
    setAmountPrecision(0);
    expect(formatAmount(1234.56)).toBe(formatAmount(1235));
    setAmountPrecision(2);
    expect(formatAmount(1234.56)).toContain('1.234,56');
  });

  it('ignores a value that is not a sensible digit count', () => {
    setAmountPrecision(2);
    setAmountPrecision(-1);
    setAmountPrecision(99);
    setAmountPrecision(1.5);
    expect(formatAmount(1234.56)).toContain('1.234,56');
  });
});
