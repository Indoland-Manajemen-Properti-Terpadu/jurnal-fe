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

/** The documents whose approval history the service keeps. */
export type ActivityKind = 'request' | 'receipt' | 'paymentRequest';
