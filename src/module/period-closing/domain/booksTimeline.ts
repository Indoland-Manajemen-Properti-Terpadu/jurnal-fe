import { addDays } from './periodRules';

/**
 * The state of the books as a strip: what is closed, what is only locked, and what is still open.
 * Weights set the width of each part. They are not to scale, the dates under each part say where it
 * ends.
 */
export type TimelineKind = 'closed' | 'locked' | 'open';

export interface TimelineSegment {
  kind: TimelineKind;
  weight: number;
  /** Last frozen day for `closed` and `locked`; first open day for `open` (absent when all open). */
  day?: string;
}

interface TimelineInput {
  closedThrough: string | undefined;
  lockedThrough: string | undefined;
}

export const buildBooksTimeline = ({
  closedThrough,
  lockedThrough,
}: TimelineInput): TimelineSegment[] => {
  // A lock that ends before the closing adds nothing: those days are already closed.
  const lockShown = lockedThrough !== undefined && lockedThrough > (closedThrough ?? '');
  const lastFrozen = lockShown ? lockedThrough : closedThrough;

  const segments: TimelineSegment[] = [];
  if (closedThrough) {
    segments.push({ kind: 'closed', weight: lockShown ? 35 : 45, day: closedThrough });
  }
  if (lockShown) {
    segments.push({ kind: 'locked', weight: closedThrough ? 25 : 40, day: lockedThrough });
  }
  const used = segments.reduce((sum, segment) => sum + segment.weight, 0);
  segments.push({
    kind: 'open',
    weight: 100 - used,
    day: lastFrozen ? addDays(lastFrozen, 1) : undefined,
  });
  return segments;
};
