import type { DraftBalance, SimpleAccount } from '../domain/beginningBalance';

type DraftEnvelope = { data?: DraftBalance } & DraftBalance;

/** The draft endpoint answers either `{ data: draft }` or the draft itself. */
export const toDraftBalance = (raw: unknown): DraftBalance | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const envelope = raw as DraftEnvelope;
  return envelope.data || envelope;
};

/** `GET /v1/accounting-periods/check` answers `{ data: { isLocked, period } }`. */
export const toDateLocked = (raw: unknown): boolean =>
  Boolean((raw as { data?: { isLocked?: unknown } } | null)?.data?.isLocked);

/** `GET /v1/accounts/simple` answers `{ data: [...] }`; anything else is an empty list. */
export const toSimpleAccounts = (raw: unknown): SimpleAccount[] => {
  const list = (raw as { data?: unknown } | null)?.data;
  return Array.isArray(list) ? (list as SimpleAccount[]) : [];
};
