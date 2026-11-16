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

/** `GET /v1/journal?limit=1&sortBy=transactionDate:asc` answers `{ data: { results: [journal] } }`. */
export const toFirstJournalDay = (raw: unknown): string | null => {
  const first = (raw as { data?: { results?: Array<{ transactionDate?: unknown }> } } | null)?.data
    ?.results?.[0]?.transactionDate;
  return typeof first === 'string' && /^\d{4}-\d{2}-\d{2}/.test(first) ? first.slice(0, 10) : null;
};
