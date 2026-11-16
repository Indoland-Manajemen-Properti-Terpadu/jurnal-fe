/**
 * The life of a bank connection as the backend reports it (see docs/prd/bank-connection.md, 5.1).
 * The user sees four steps: fill the form, review, sign and send, active.
 */
export const CONNECTION_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'IN_REVIEW',
  'NEEDS_REVISION',
  'REJECTED',
  'AWAITING_SIGNATURE',
  'SIGNED',
  'ACTIVE',
  'SUSPENDED',
  'ERROR',
  'EXPIRED',
  'REVOKED',
  'CANCELLED',
] as const;

export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export type NextAction =
  | 'FILL_FORM'
  | 'FIX_FORM'
  | 'WAIT_REVIEW'
  | 'SIGN'
  | 'WAIT_BANK'
  | 'NONE'
  | 'RECONNECT';

export type StatusTone = 'neutral' | 'info' | 'ok' | 'warn' | 'bad';

export type Step = 1 | 2 | 3 | 4;

const STEP: Record<ConnectionStatus, Step | null> = {
  DRAFT: 1,
  NEEDS_REVISION: 1,
  SUBMITTED: 2,
  IN_REVIEW: 2,
  REJECTED: null,
  AWAITING_SIGNATURE: 3,
  SIGNED: 3,
  ACTIVE: 4,
  SUSPENDED: 4,
  ERROR: 4,
  EXPIRED: 4,
  REVOKED: null,
  CANCELLED: null,
};

/** The step of the four the user is on; `null` once the request is over. */
export const connectionStep = (status: ConnectionStatus): Step | null => STEP[status];

/** Only a draft or a request sent back can be changed. */
export const isEditable = (status: ConnectionStatus): boolean =>
  status === 'DRAFT' || status === 'NEEDS_REVISION';

/** The connected view applies to every status after activation, including a paused or failing one. */
export const isLive = (status: ConnectionStatus): boolean =>
  status === 'ACTIVE' || status === 'SUSPENDED' || status === 'ERROR' || status === 'EXPIRED';

/** A request that is over; the account can start a new one. */
export const isTerminal = (status: ConnectionStatus): boolean =>
  status === 'REJECTED' || status === 'REVOKED' || status === 'CANCELLED';

const TONE: Record<ConnectionStatus, StatusTone> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  IN_REVIEW: 'info',
  NEEDS_REVISION: 'warn',
  REJECTED: 'bad',
  AWAITING_SIGNATURE: 'warn',
  SIGNED: 'info',
  ACTIVE: 'ok',
  SUSPENDED: 'warn',
  ERROR: 'bad',
  EXPIRED: 'warn',
  REVOKED: 'neutral',
  CANCELLED: 'neutral',
};

export const statusTone = (status: ConnectionStatus): StatusTone => TONE[status];

const FALLBACK_ACTION: Record<ConnectionStatus, NextAction> = {
  DRAFT: 'FILL_FORM',
  SUBMITTED: 'WAIT_REVIEW',
  IN_REVIEW: 'WAIT_REVIEW',
  NEEDS_REVISION: 'FIX_FORM',
  REJECTED: 'RECONNECT',
  AWAITING_SIGNATURE: 'SIGN',
  SIGNED: 'WAIT_BANK',
  ACTIVE: 'NONE',
  SUSPENDED: 'NONE',
  ERROR: 'NONE',
  EXPIRED: 'RECONNECT',
  REVOKED: 'RECONNECT',
  CANCELLED: 'RECONNECT',
};

/** The server names the next action; when it does not, the status decides. */
export const resolveNextAction = (status: ConnectionStatus, fromServer?: NextAction): NextAction =>
  fromServer ?? FALLBACK_ACTION[status];

/** An account has one connection at a time: an open or live one blocks a new request; an expired or finished one does not. */
export const blocksNewRequest = (status: ConnectionStatus): boolean =>
  !isTerminal(status) && status !== 'EXPIRED';
