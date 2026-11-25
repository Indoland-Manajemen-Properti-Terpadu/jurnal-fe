import type {
  ApprovalLevelProgress,
  ApprovalState,
} from '@/module/purchases/domain/purchaseCommon';

/**
 * Where an approval stands: the level waiting for a decision, counted from 1, out of every level
 * the approval has. Levels run in order (for example Chief Finance, then Building Manager); null
 * once no level is waiting.
 */
export const approvalStep = (
  approval: ApprovalState
): { current: number; total: number; level: ApprovalLevelProgress } | null => {
  const level = approval.pending[0];
  if (!level) return null;
  return { current: level.level + 1, total: approval.plan.length, level };
};

/**
 * What to say about the roles inside one level. `ANY` and `ALL` apply within a level only: a level
 * with one role needs no remark, and neither mode is the rule of the whole approval.
 */
export const levelRule = (
  level: Pick<ApprovalLevelProgress, 'mode' | 'roles'>
): 'any' | 'all' | null => {
  if (level.roles.length < 2) return null;
  return level.mode === 'ALL' ? 'all' : 'any';
};

export interface ApprovalConfirmation {
  current: number;
  total: number;
  /**
   * What this signature does: `next` closes the level and hands the document to the next one,
   * `final` approves the document, `sameLevel` leaves the level waiting for the other roles.
   */
  outcome: 'next' | 'final' | 'sameLevel';
  /** The level the document goes to next; only for `next`. */
  next: string | null;
}

/**
 * What the "Setujui" click will do, for the question asked before it: which approval this is out of
 * how many and who is next. In a level where all roles must sign, the click closes the level only
 * when it is the last role still missing.
 */
export const approvalConfirmation = (approval: ApprovalState): ApprovalConfirmation | null => {
  const step = approvalStep(approval);
  if (!step) return null;
  const { level, current, total } = step;
  const missing = level.roles.filter((role) => !role.approved).length;
  const closesLevel = level.mode !== 'ALL' || missing <= 1;
  if (!closesLevel) return { current, total, outcome: 'sameLevel', next: null };
  if (current >= total) return { current, total, outcome: 'final', next: null };
  return { current, total, outcome: 'next', next: approval.plan[current]?.name ?? null };
};
