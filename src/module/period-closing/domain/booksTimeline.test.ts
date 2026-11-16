import { describe, expect, it } from 'vitest';
import { buildBooksTimeline } from './booksTimeline';

describe('buildBooksTimeline', () => {
  it('is all open when nothing is frozen', () => {
    expect(buildBooksTimeline({ closedThrough: undefined, lockedThrough: undefined })).toEqual([
      { kind: 'open', weight: 100, day: undefined },
    ]);
  });

  it('opens the day after the closing', () => {
    const parts = buildBooksTimeline({ closedThrough: '2025-12-31', lockedThrough: undefined });
    expect(parts.map((part) => part.kind)).toEqual(['closed', 'open']);
    expect(parts[1].day).toBe('2026-01-01');
  });

  it('shows a lock that runs past the closing and opens after it', () => {
    const parts = buildBooksTimeline({ closedThrough: '2025-12-31', lockedThrough: '2026-01-31' });
    expect(parts.map((part) => part.kind)).toEqual(['closed', 'locked', 'open']);
    expect(parts[2].day).toBe('2026-02-01');
  });

  it('ignores a lock that ends inside the closed days', () => {
    const parts = buildBooksTimeline({ closedThrough: '2025-12-31', lockedThrough: '2025-06-30' });
    expect(parts.map((part) => part.kind)).toEqual(['closed', 'open']);
  });

  it('shows a lock alone when the books were never closed', () => {
    const parts = buildBooksTimeline({ closedThrough: undefined, lockedThrough: '2026-03-31' });
    expect(parts.map((part) => part.kind)).toEqual(['locked', 'open']);
    expect(parts[1].day).toBe('2026-04-01');
  });

  it('always adds up to a full strip', () => {
    const total = (closed?: string, locked?: string) =>
      buildBooksTimeline({ closedThrough: closed, lockedThrough: locked }).reduce(
        (sum, part) => sum + part.weight,
        0
      );
    expect(total()).toBe(100);
    expect(total('2025-12-31')).toBe(100);
    expect(total('2025-12-31', '2026-01-31')).toBe(100);
    expect(total(undefined, '2026-01-31')).toBe(100);
  });
});
