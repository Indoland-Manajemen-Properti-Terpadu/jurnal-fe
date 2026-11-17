import { describe, expect, it } from 'vitest';
import { buildBooksTimeline, MAX_TIMELINE_LOCKS } from './booksTimeline';

const kinds = (
  closedThrough: string | undefined,
  locks: { startDate: string; endDate: string }[]
) => buildBooksTimeline({ closedThrough, locks }).map((part) => part.kind);

describe('buildBooksTimeline', () => {
  it('is all open when nothing is frozen', () => {
    expect(buildBooksTimeline({ closedThrough: undefined, locks: [] })).toEqual([
      { kind: 'open', weight: 100, startDate: undefined },
    ]);
  });

  it('opens the day after the closing', () => {
    const parts = buildBooksTimeline({ closedThrough: '2025-12-31', locks: [] });
    expect(parts.map((part) => part.kind)).toEqual(['closed', 'open']);
    expect(parts[0].endDate).toBe('2025-12-31');
    expect(parts[1].startDate).toBe('2026-01-01');
  });

  it('draws a lock at its own range and leaves the days before it open (PRO-83)', () => {
    const parts = buildBooksTimeline({
      closedThrough: undefined,
      locks: [{ startDate: '2025-01-01', endDate: '2025-02-28' }],
    });
    expect(parts.map((part) => part.kind)).toEqual(['open', 'locked', 'open']);
    expect(parts[0]).toMatchObject({ startDate: undefined, endDate: '2024-12-31' });
    expect(parts[1]).toMatchObject({ startDate: '2025-01-01', endDate: '2025-02-28' });
    expect(parts[2].startDate).toBe('2025-03-01');
  });

  it('shows an open stretch between a closing and a later lock', () => {
    const parts = buildBooksTimeline({
      closedThrough: '2025-12-31',
      locks: [{ startDate: '2026-03-01', endDate: '2026-03-31' }],
    });
    expect(parts.map((part) => part.kind)).toEqual(['closed', 'open', 'locked', 'open']);
    expect(parts[1]).toMatchObject({ startDate: '2026-01-01', endDate: '2026-02-28' });
  });

  it('puts a lock that follows the closing straight after it', () => {
    expect(kinds('2025-12-31', [{ startDate: '2026-01-01', endDate: '2026-01-31' }])).toEqual([
      'closed',
      'locked',
      'open',
    ]);
  });

  it('ignores a lock inside the closed days and clips one that overlaps the closing', () => {
    expect(kinds('2025-12-31', [{ startDate: '2025-03-01', endDate: '2025-06-30' }])).toEqual([
      'closed',
      'open',
    ]);
    const clipped = buildBooksTimeline({
      closedThrough: '2025-12-31',
      locks: [{ startDate: '2025-12-01', endDate: '2026-01-31' }],
    });
    expect(clipped[1]).toMatchObject({ kind: 'locked', startDate: '2026-01-01' });
  });

  it('merges locks that overlap or touch', () => {
    const parts = buildBooksTimeline({
      closedThrough: undefined,
      locks: [
        { startDate: '2026-02-01', endDate: '2026-02-28' },
        { startDate: '2026-01-01', endDate: '2026-01-31' },
      ],
    });
    const locked = parts.filter((part) => part.kind === 'locked');
    expect(locked).toEqual([
      expect.objectContaining({ startDate: '2026-01-01', endDate: '2026-02-28' }),
    ]);
  });

  it('draws only the latest locks, and no leading open part when older ones are left out', () => {
    const locks = Array.from({ length: MAX_TIMELINE_LOCKS + 2 }, (_, index) => ({
      startDate: `2026-0${index + 1}-10`,
      endDate: `2026-0${index + 1}-20`,
    }));
    const parts = buildBooksTimeline({ closedThrough: undefined, locks });
    expect(parts.filter((part) => part.kind === 'locked')).toHaveLength(MAX_TIMELINE_LOCKS);
    expect(parts[0].kind).toBe('locked');
  });

  it('always adds up to a full strip', () => {
    const total = (closed: string | undefined, locks: { startDate: string; endDate: string }[]) =>
      buildBooksTimeline({ closedThrough: closed, locks }).reduce(
        (sum, part) => sum + part.weight,
        0
      );
    const lock = { startDate: '2026-03-01', endDate: '2026-03-31' };
    expect(total(undefined, [])).toBe(100);
    expect(total('2025-12-31', [])).toBe(100);
    expect(total('2025-12-31', [lock])).toBe(100);
    expect(total(undefined, [lock])).toBe(100);
    expect(
      total(undefined, [
        lock,
        { startDate: '2026-05-01', endDate: '2026-05-31' },
        { startDate: '2026-07-01', endDate: '2026-07-31' },
        { startDate: '2026-09-01', endDate: '2026-09-30' },
      ])
    ).toBe(100);
  });
});
