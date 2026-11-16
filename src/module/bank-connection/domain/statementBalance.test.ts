import { describe, expect, it } from 'vitest';
import { ageOf, balanceGap } from '@/module/bank-connection/domain/statementBalance';

describe('balanceGap', () => {
  it('is the bank balance minus the book balance, cent-exact', () => {
    expect(balanceGap(127_500_000, 127_472_682)).toEqual({ amount: 27_318, isZero: false });
    expect(balanceGap(0.3, 0.1)).toEqual({ amount: 0.2, isZero: false });
  });

  it('is zero when both agree', () => {
    expect(balanceGap(100, 100)).toEqual({ amount: 0, isZero: true });
  });

  it('is negative when the books hold more than the bank', () => {
    expect(balanceGap(100, 150)).toEqual({ amount: -50, isZero: false });
  });
});

describe('ageOf', () => {
  const now = new Date('2026-11-12T10:00:00Z');
  it('says how long ago something happened in the largest sensible unit', () => {
    expect(ageOf('2026-11-12T09:59:40Z', now)).toEqual({ unit: 'now', value: 0 });
    expect(ageOf('2026-11-12T09:50:00Z', now)).toEqual({ unit: 'minutes', value: 10 });
    expect(ageOf('2026-11-12T07:00:00Z', now)).toEqual({ unit: 'hours', value: 3 });
    expect(ageOf('2026-11-09T10:00:00Z', now)).toEqual({ unit: 'days', value: 3 });
  });

  it('never goes negative for a time slightly in the future', () => {
    expect(ageOf('2026-11-12T10:00:30Z', now)).toEqual({ unit: 'now', value: 0 });
  });
});
