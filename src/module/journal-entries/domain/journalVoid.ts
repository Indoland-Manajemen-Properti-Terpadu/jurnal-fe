import type { JournalEntryDetail } from './journalEntry';

type VoidSubject = Pick<JournalEntryDetail, 'status' | 'canVoid' | 'voidBlockedReason'>;

/**
 * A journal entry cannot be edited, only voided: the server then writes a reversal entry. It
 * allows a void only when `canVoid` is true and gives the reason otherwise (`voidBlockedReason`:
 * a petty cash entry, an entry that is already void, ...).
 */
export type VoidGate =
  | { allowed: true }
  | { allowed: false; kind: 'void' | 'reversal' | 'blocked'; reason?: string };

export const voidGate = (entry: VoidSubject): VoidGate => {
  if (entry.status === 'VOID') return { allowed: false, kind: 'void' };
  if (entry.status === 'REVERSAL') return { allowed: false, kind: 'reversal' };
  if (entry.canVoid === true) return { allowed: true };
  return { allowed: false, kind: 'blocked', reason: entry.voidBlockedReason ?? undefined };
};
