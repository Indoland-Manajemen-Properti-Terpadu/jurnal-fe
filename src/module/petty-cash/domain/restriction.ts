import type { AdvanceStatusInfo } from '@/module/petty-cash/domain/pettyCashEntities';

/** What a controller can do with one employee's right to request advances. */
export type RestrictionKind = 'block' | 'unblock' | 'override' | 'revoke';

/**
 * Blocking is for people who are not blocked by hand; lifting is for those who are. An exception
 * only makes sense against an overdue block, and can be withdrawn while one is in force.
 */
export const availableRestrictionActions = (status: AdvanceStatusInfo): RestrictionKind[] => {
  const manual = status.reasons.some((reason) => reason.type === 'MANUAL');
  const overdue = status.reasons.some((reason) => reason.type === 'OVERDUE');
  const actions: RestrictionKind[] = [];
  if (manual) actions.push('unblock');
  else actions.push('block');
  if (overdue || status.overrideUntil) actions.push('override');
  if (status.overrideUntil) actions.push('revoke');
  return actions;
};

export type RestrictionIssueCode = 'REQUIRED' | 'PAST_DATE';

export interface RestrictionDraft {
  kind: RestrictionKind;
  reason: string;
  /** YYYY-MM-DD; only the exception needs it. */
  until: string;
}

export const validateRestriction = (
  draft: RestrictionDraft,
  today: string
): Array<{ path: string; code: RestrictionIssueCode }> => {
  const issues: Array<{ path: string; code: RestrictionIssueCode }> = [];
  if (draft.reason.trim() === '') issues.push({ path: 'reason', code: 'REQUIRED' });
  if (draft.kind === 'override') {
    if (draft.until === '') issues.push({ path: 'until', code: 'REQUIRED' });
    else if (draft.until < today) issues.push({ path: 'until', code: 'PAST_DATE' });
  }
  return issues;
};
