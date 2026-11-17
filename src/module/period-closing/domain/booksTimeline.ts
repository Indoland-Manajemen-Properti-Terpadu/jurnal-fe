import { addDays, type DateRange } from './periodRules';

/**
 * The state of the books as a strip: what is closed, what is only locked, and what is still open.
 * Weights set the width of each part. They are not to scale, the dates under each part say what it
 * covers.
 *
 * A closing freezes everything from the start of the books through its end date (its journal covers
 * all of that), so it is one part that reaches back to the oldest day. A lock freezes only its own
 * range, so a day before the lock stays open and is drawn as an open part.
 */
export type TimelineKind = 'closed' | 'locked' | 'open';

export interface TimelineSegment {
  kind: TimelineKind;
  weight: number;
  /** First day of the part; absent when it reaches back to the oldest day. */
  startDate?: string;
  /** Last day of the part; absent for the open part that runs on from the last frozen day. */
  endDate?: string;
}

interface TimelineInput {
  closedThrough: string | undefined;
  /** Ranges of the active locks, in any order. */
  locks: readonly DateRange[];
}

/** Most locks drawn; older ones are left out so the labels stay readable. */
export const MAX_TIMELINE_LOCKS = 3;

/** Lock ranges that add something beyond the closing, clipped to it, merged and in date order. */
const frozenLocks = (
  closedThrough: string | undefined,
  locks: readonly DateRange[]
): DateRange[] => {
  const floor = closedThrough ? addDays(closedThrough, 1) : '';
  const clipped = locks
    .filter((lock) => lock.endDate >= floor)
    .map((lock) => ({
      startDate: lock.startDate > floor ? lock.startDate : floor,
      endDate: lock.endDate,
    }))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return clipped.reduce<DateRange[]>((merged, lock) => {
    const last = merged[merged.length - 1];
    if (last && lock.startDate <= addDays(last.endDate, 1)) {
      if (lock.endDate > last.endDate) last.endDate = lock.endDate;
      return merged;
    }
    return [...merged, { ...lock }];
  }, []);
};

const TRAILING_WEIGHT = 30;
const GAP_WEIGHT = 12;

export const buildBooksTimeline = ({ closedThrough, locks }: TimelineInput): TimelineSegment[] => {
  const all = frozenLocks(closedThrough, locks);
  const shown = all.slice(-MAX_TIMELINE_LOCKS);
  const droppedOlder = shown.length < all.length;

  const parts: Omit<TimelineSegment, 'weight'>[] = [];
  let lastFrozen = closedThrough;
  if (closedThrough) parts.push({ kind: 'closed', endDate: closedThrough });

  shown.forEach((lock, index) => {
    const hasGap = lastFrozen
      ? lock.startDate > addDays(lastFrozen, 1)
      : index === 0 && !droppedOlder;
    if (hasGap) {
      parts.push({
        kind: 'open',
        startDate: lastFrozen ? addDays(lastFrozen, 1) : undefined,
        endDate: addDays(lock.startDate, -1),
      });
    }
    parts.push({ kind: 'locked', startDate: lock.startDate, endDate: lock.endDate });
    lastFrozen = lock.endDate;
  });
  parts.push({ kind: 'open', startDate: lastFrozen ? addDays(lastFrozen, 1) : undefined });

  // Weights: the running open part and each gap get a fixed share; the frozen parts split the rest.
  const gaps = parts.filter((part, index) => part.kind === 'open' && index < parts.length - 1);
  const frozen = parts.filter((part) => part.kind !== 'open');
  const frozenShare = frozen.length
    ? Math.floor((100 - TRAILING_WEIGHT - gaps.length * GAP_WEIGHT) / frozen.length)
    : 0;
  const trailing = frozen.length ? TRAILING_WEIGHT : 100;
  const remainder = frozen.length
    ? 100 - trailing - gaps.length * GAP_WEIGHT - frozenShare * frozen.length
    : 0;

  let remainderGiven = false;
  return parts.map((part, index) => {
    if (part.kind === 'open') {
      return { ...part, weight: index === parts.length - 1 ? trailing : GAP_WEIGHT };
    }
    const extra = remainderGiven ? 0 : remainder;
    remainderGiven = true;
    return { ...part, weight: frozenShare + extra };
  });
};
