import type { WriteOffStatus } from '@/module/assets/domain/writeOff';

/** Badge colors of a report's status: waiting is a warning, approved a success, rejected a failure. */
export const WRITE_OFF_STATUS_COLOR: Record<WriteOffStatus, string> = {
  PENDING_APPROVAL: 'orange',
  APPROVED: 'teal',
  REJECTED: 'red',
};
