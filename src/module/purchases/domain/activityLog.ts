/** One action in the history of a document: who did what, as which role, when, and with what note. */
export interface ActivityEntry {
  id: string;
  /** The service's code of the action (`APPROVE`, `REJECT`, ...). */
  action: string;
  /** The action in words ("Disetujui"). */
  label: string;
  /** Which approval step this was, counted from 1; null for an action that is not a step. */
  step: number | null;
  totalSteps: number | null;
  /** The part of the document the action belongs to ("Pengadaan"); empty when none. */
  stageLabel: string;
  roleName: string;
  byName: string;
  at: string;
  note: string;
  /** The service's own sentence ("Disetujui, langkah 1 dari 2 (Chief Finance)"). */
  text: string;
}

/** Whether an action approved, returned, or stopped the document. */
export type ActivityTone = 'positive' | 'warning' | 'negative';

// Matched by prefix so both `REJECT` and `REJECTED` (or `approve` / `APPROVED`) count.
const POSITIVE = ['APPROV', 'VERIF'];
const WARNING = ['RETURN'];
const NEGATIVE = ['REJECT', 'CANCEL', 'VOID', 'WITHDRAW'];

export const activityTone = (action: string): ActivityTone | undefined => {
  const code = action.toUpperCase();
  if (POSITIVE.some((prefix) => code.startsWith(prefix))) return 'positive';
  if (WARNING.some((prefix) => code.startsWith(prefix))) return 'warning';
  if (NEGATIVE.some((prefix) => code.startsWith(prefix))) return 'negative';
  return undefined;
};

/** The documents whose approval history the service keeps. */
export type ActivityKind = 'request' | 'receipt' | 'paymentRequest';
