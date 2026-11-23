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
