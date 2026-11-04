import type { PendingApprover } from '@/module/petty-cash/domain/approval';
import type {
  AdvanceRecord,
  CountRecord,
  PettyCashVoucherRecord,
  ReimbursementRecord,
} from '@/module/petty-cash/domain/pettyCashEntities';
import { advanceStatusTone, type AdvanceStatus } from '@/module/petty-cash/domain/pettyCashStatus';

/**
 * The journey of a document as one ordered list: what already happened (from the record's own
 * timestamps) followed, while it waits, by the approval stages still ahead. Every drawer renders
 * the same list, so the four documents read alike.
 */
export type JourneyEvent =
  | 'CREATED'
  | 'COUNTED'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'VOIDED'
  | 'CANCELLED'
  | 'DISBURSED';

export type JourneyTitle =
  | { kind: 'event'; event: JourneyEvent }
  | { kind: 'status'; status: AdvanceStatus }
  | { kind: 'approval'; approver: PendingApprover };

/** done: happened; latest: the last thing that happened; waiting: the stage now; upcoming: later. */
export type StepState = 'done' | 'latest' | 'waiting' | 'upcoming';

export interface JourneyStep {
  id: string;
  title: JourneyTitle;
  at: string | null;
  byName: string | null;
  note: string | null;
  state: StepState;
  /** A refusal: drawn with a cross instead of a check. */
  refused: boolean;
}

type PastStep = Omit<JourneyStep, 'state'>;

const event = (
  name: JourneyEvent,
  at: string | null,
  byName: string | null = null,
  note: string | null = null
): PastStep | null =>
  at
    ? {
        id: `${name}-${at}`,
        title: { kind: 'event', event: name },
        at,
        byName,
        note,
        refused: name === 'REJECTED',
      }
    : null;

const compose = (past: Array<PastStep | null>, pending: PendingApprover[] = []): JourneyStep[] => {
  const happened = past
    .filter((step): step is PastStep => step !== null)
    .sort((a, b) => (a.at as string).localeCompare(b.at as string));
  const done: JourneyStep[] = happened.map((step, index) => ({
    ...step,
    state: pending.length === 0 && index === happened.length - 1 ? 'latest' : 'done',
  }));
  const ahead: JourneyStep[] = pending.map((approver, index) => ({
    id: `approval-${approver.level}`,
    title: { kind: 'approval', approver },
    at: null,
    byName: null,
    note: null,
    state: index === 0 ? 'waiting' : 'upcoming',
    refused: false,
  }));
  return [...done, ...ahead];
};

/**
 * A voucher made from an advance is created by the system when finance verifies the settlement,
 * after its submission; its creation is then not a step of its own.
 */
const createdBeforeSubmission = (voucher: PettyCashVoucherRecord) =>
  !voucher.submittedAt || voucher.createdAt <= voucher.submittedAt;

export const voucherJourney = (voucher: PettyCashVoucherRecord): JourneyStep[] =>
  compose([
    createdBeforeSubmission(voucher)
      ? event('CREATED', voucher.createdAt, voucher.requestedBy?.name ?? null)
      : null,
    event('SUBMITTED', voucher.submittedAt, voucher.requestedBy?.name ?? null),
    event('APPROVED', voucher.approvedAt, voucher.approvedBy?.name ?? null),
    event('REJECTED', voucher.rejectedAt, null, voucher.rejectedReason),
    event('VOIDED', voucher.voidedAt, null, voucher.voidReason),
  ]);

export const countJourney = (count: CountRecord): JourneyStep[] =>
  compose(
    [
      event('COUNTED', count.countedAt, count.countedBy?.name ?? null),
      event('SUBMITTED', count.submittedAt, count.countedBy?.name ?? null),
      event('APPROVED', count.approvedAt, count.approvedBy?.name ?? null),
      event('REJECTED', count.rejectedAt, count.rejectedBy?.name ?? null, count.rejectedReason),
    ],
    count.status === 'SUBMITTED' ? count.pendingApprovers : []
  );

export const reimbursementJourney = (record: ReimbursementRecord): JourneyStep[] =>
  compose(
    [
      event('SUBMITTED', record.submittedAt, record.submittedBy?.name ?? null, record.notes),
      event('APPROVED', record.approvedAt, record.approvedBy?.name ?? null),
      event('REJECTED', record.rejectedAt, record.rejectedBy?.name ?? null, record.rejectedReason),
      event('CANCELLED', record.cancelledAt, record.cancelledBy?.name ?? null),
      event('DISBURSED', record.disbursedAt, record.disbursedBy?.name ?? null),
    ],
    record.status === 'SUBMITTED' ? record.pendingApprovers : []
  );

/** The advance keeps its own status history; names come from `nameOf` (the history holds ids). */
export const advanceJourney = (
  advance: AdvanceRecord,
  nameOf: (userId: string) => string | null
): JourneyStep[] =>
  compose(
    advance.statusHistory.map((entry, index) => ({
      id: `${entry.status}-${entry.at}-${index}`,
      title: { kind: 'status' as const, status: entry.status },
      at: entry.at,
      byName: nameOf(entry.byId),
      note: entry.note,
      refused: advanceStatusTone[entry.status] === 'danger',
    }))
  );
