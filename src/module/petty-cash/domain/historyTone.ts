import type { StatusTone } from '@/module/petty-cash/domain/pettyCashStatus';

/**
 * How a recorded action reads at a glance on a timeline: a refusal is red, a completed step green,
 * a request or creation blue and anything else neutral. Unknown actions stay neutral.
 */
export const auditActionTone = (action: string): StatusTone => {
  if (/(^|_)(REJECT|VOID|CANCEL|CLOSE|BLOCK)$/.test(action) || action.endsWith('_REJECT')) {
    return 'danger';
  }
  if (/(APPROVE|DISBURSE|VERIFY|SETTLED|UNBLOCK|OVERRIDE)/.test(action)) return 'success';
  if (/(CREATE|SUBMIT|ADD)/.test(action)) return 'info';
  return 'neutral';
};
