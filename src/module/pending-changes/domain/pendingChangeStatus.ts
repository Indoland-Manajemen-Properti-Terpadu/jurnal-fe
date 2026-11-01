import { PENDING_CHANGE_STATUSES, type PendingChangeStatus } from './pendingChange';

export const isPendingChangeStatus = (value: unknown): value is PendingChangeStatus =>
  PENDING_CHANGE_STATUSES.some((status) => status === value);

/** Anything the API sends that is not a known status is treated as still waiting for approval. */
export const toPendingChangeStatus = (value: unknown): PendingChangeStatus =>
  isPendingChangeStatus(value) ? value : 'PENDING';

/** There is no reject action: every change that is not yet approved can be approved. */
export const canApprove = (status: PendingChangeStatus): boolean => status !== 'APPROVED';
