import type { JournalEntryDetail } from './journalEntry';

type VoidSubject = Pick<
  JournalEntryDetail,
  'status' | 'canVoid' | 'voidBlockedReason' | 'sourceType'
>;

/**
 * A journal entry cannot be edited, only voided: the server then writes a reversal entry. It
 * allows a void only when `canVoid` is true and gives the reason otherwise (`voidBlockedReason`:
 * a petty cash entry, an entry that is already void, ...).
 */
export type VoidGate =
  | { allowed: true }
  | { allowed: false; kind: 'void' | 'reversal' | 'source' | 'blocked'; reason?: string };

/** Journals the sales module posts. Like a sales return, they are undone from their own document. */
const SALES_SOURCES = new Set(['SALE', 'SALE_PAYMENT']);

export const voidGate = (entry: VoidSubject): VoidGate => {
  if (entry.status === 'VOID') return { allowed: false, kind: 'void' };
  if (entry.status === 'REVERSAL') return { allowed: false, kind: 'reversal' };
  if (entry.sourceType && SALES_SOURCES.has(entry.sourceType)) {
    return { allowed: false, kind: 'source' };
  }
  if (entry.canVoid === true) return { allowed: true };
  return { allowed: false, kind: 'blocked', reason: entry.voidBlockedReason ?? undefined };
};
