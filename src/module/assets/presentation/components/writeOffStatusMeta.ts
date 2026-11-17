import type { WriteOffStatus } from '@/module/assets/domain/writeOff';

/**
 * Colour only carries real state, as in purchasing: waiting, approved or refused. Everything else
 * on these screens stays brand or neutral.
 */
export const WRITE_OFF_STATUS_COLOR: Record<WriteOffStatus, string> = {
  PENDING_APPROVAL: 'yellow',
  APPROVED: 'green',
  REJECTED: 'red',
};
