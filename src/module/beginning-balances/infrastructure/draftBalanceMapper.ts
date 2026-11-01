import type { DraftBalance } from '../domain/beginningBalance';

type DraftEnvelope = { data?: DraftBalance } & DraftBalance;

/** The draft endpoint answers either `{ data: draft }` or the draft itself. */
export const toDraftBalance = (raw: unknown): DraftBalance | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const envelope = raw as DraftEnvelope;
  return envelope.data || envelope;
};
