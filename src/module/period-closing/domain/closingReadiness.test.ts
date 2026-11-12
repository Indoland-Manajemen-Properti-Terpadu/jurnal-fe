import { describe, expect, it } from 'vitest';
import {
  NO_CONFIRMATIONS,
  confirmedCount,
  isReadyToReview,
  retainedEarningsStatus,
  trialBalanceStatus,
} from './closingReadiness';

const allConfirmed = { bankReconciled: true, adjustmentsPosted: true, transactionsRecorded: true };

describe('closing readiness', () => {
  it('fails without a retained earnings account', () => {
    expect(retainedEarningsStatus(true, undefined)).toBe('loading');
    expect(retainedEarningsStatus(false, null)).toBe('fail');
    expect(retainedEarningsStatus(false, { id: 'acc' })).toBe('pass');
  });

  it('warns on an unbalanced trial balance, comparing whole cents', () => {
    expect(trialBalanceStatus(false, { debit: 0.1 + 0.2, credit: 0.3 })).toBe('pass');
    expect(trialBalanceStatus(false, { debit: 100, credit: 99.99 })).toBe('warn');
    expect(trialBalanceStatus(false, undefined)).toBe('warn');
  });

  it('is ready only when nothing blocks and every manual step is confirmed', () => {
    const base = { retainedEarnings: 'pass' as const, trialBalance: 'warn' as const };
    expect(isReadyToReview({ ...base, confirmations: allConfirmed })).toBe(true);
    expect(isReadyToReview({ ...base, confirmations: NO_CONFIRMATIONS })).toBe(false);
    expect(
      isReadyToReview({ ...base, retainedEarnings: 'fail', confirmations: allConfirmed })
    ).toBe(false);
    expect(confirmedCount({ ...NO_CONFIRMATIONS, bankReconciled: true })).toBe(1);
  });
});
