import { toMinor } from '@/lib/money/money';

/**
 * The checklist before closing the books. Two checks read data (the retained earnings mapping
 * the server needs, and whether the trial balance is balanced); the rest are steps only the user
 * can confirm, as in any period-end close: bank accounts reconciled, adjusting entries posted and
 * every transaction of the period recorded.
 */

export type CheckStatus = 'loading' | 'pass' | 'warn' | 'fail';

export const MANUAL_CHECKS = [
  'bankReconciled',
  'adjustmentsPosted',
  'transactionsRecorded',
] as const;

export type ManualCheck = (typeof MANUAL_CHECKS)[number];

export type ManualConfirmations = Record<ManualCheck, boolean>;

export const NO_CONFIRMATIONS: ManualConfirmations = {
  bankReconciled: false,
  adjustmentsPosted: false,
  transactionsRecorded: false,
};

/** Without a retained earnings account the server refuses the closing, so nothing can go on. */
export const retainedEarningsStatus = (
  loading: boolean,
  account: { id: string } | null | undefined
): CheckStatus => {
  if (loading) return 'loading';
  return account?.id ? 'pass' : 'fail';
};

/** An unbalanced trial balance points to a recording error worth fixing first, but does not block. */
export const trialBalanceStatus = (
  loading: boolean,
  totals: { debit: number; credit: number } | undefined
): CheckStatus => {
  if (loading) return 'loading';
  if (!totals) return 'warn';
  return toMinor(totals.debit) === toMinor(totals.credit) ? 'pass' : 'warn';
};

export interface ReadinessState {
  retainedEarnings: CheckStatus;
  trialBalance: CheckStatus;
  confirmations: ManualConfirmations;
}

export const confirmedCount = (confirmations: ManualConfirmations): number =>
  MANUAL_CHECKS.filter((check) => confirmations[check]).length;

/** The checklist step is done when nothing blocks and every manual step is confirmed. */
export const isReadyToReview = (state: ReadinessState): boolean =>
  state.retainedEarnings === 'pass' &&
  state.trialBalance !== 'loading' &&
  confirmedCount(state.confirmations) === MANUAL_CHECKS.length;
