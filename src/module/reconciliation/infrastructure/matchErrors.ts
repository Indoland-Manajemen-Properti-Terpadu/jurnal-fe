import axios from 'axios';

/** Keys of `notifications.reason.*` in the reconciliation namespace. */
export type MatchFailureReason =
  | 'amountMismatch'
  | 'alreadyReconciled'
  | 'statementNotFound'
  | 'serverError'
  | 'unknown';

interface ServerMatchErrors {
  message?: string;
  data?: { errors?: { error?: string }[] };
}

const reasonOf = (message: string): MatchFailureReason | null => {
  if (message.startsWith('Amount mismatch')) return 'amountMismatch';
  if (message.includes('already reconciled')) return 'alreadyReconciled';
  if (message.startsWith('Unreconciled bank statement not found')) return 'statementNotFound';
  return null;
};

/**
 * The server says "All matches failed" with the real reason per match in `data.errors`, and a
 * raw database message on a 500. The screen shows a reason the user can act on instead.
 */
export const matchFailureReason = (error: unknown): MatchFailureReason => {
  if (!axios.isAxiosError<ServerMatchErrors>(error)) return 'unknown';
  if ((error.response?.status ?? 0) >= 500) return 'serverError';
  const reasons = (error.response?.data?.data?.errors ?? [])
    .map((item) => reasonOf(item.error ?? ''))
    .filter((reason): reason is MatchFailureReason => reason !== null);
  return reasons[0] ?? 'unknown';
};
