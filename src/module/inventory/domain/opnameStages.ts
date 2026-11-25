import { OPNAME_STEPS, stepIndex, type StockOpname } from '@/module/inventory/domain/stockOpname';

export interface StageDetail {
  at: string | null;
  by: string | null;
}

export type StageKey = 'draft' | 'counting' | 'pending_approval' | 'posted';
export type OpnameStageDetails = Record<StageKey, StageDetail>;

const EMPTY: StageDetail = { at: null, by: null };

/** The service writes the history in words, so the entries are told apart by how they start. */
const lastEntry = (opname: StockOpname, startsWith: string): StageDetail => {
  const found = [...opname.history].reverse().find((entry) => entry.action.startsWith(startsWith));
  return found ? { at: found.at, by: found.userName || null } : EMPTY;
};

/**
 * When each stage of a count happened and who did it, for the "Tahapan" card. A cancelled count is
 * off the stepper, but the stages it went through stay marked, so `done` is worked out from what
 * is on record rather than from the status.
 */
export const opnameStages = (
  opname: StockOpname
): { done: number; details: OpnameStageDetails } => {
  const submitted = lastEntry(opname, 'Dikirim');
  const approved = lastEntry(opname, 'Disetujui');
  const details: OpnameStageDetails = {
    draft: { at: opname.createdAt || null, by: opname.createdByName || null },
    counting: { at: opname.startedAt, by: lastEntry(opname, 'Hitungan dimulai').by },
    pending_approval: submitted,
    posted: {
      at: opname.postedAt ?? approved.at,
      // The service's own record wins; the history stands in for counts made before it kept one.
      by: opname.approvedByName ?? approved.by,
    },
  };

  const { status } = opname;
  if (status === 'posted') return { done: OPNAME_STEPS.length, details };
  if (status !== 'cancelled') return { done: stepIndex(status), details };

  let done = 1;
  if (details.counting.at) done = 2;
  if (details.pending_approval.at) done = 3;
  if (details.posted.at) done = 4;
  return { done, details };
};
