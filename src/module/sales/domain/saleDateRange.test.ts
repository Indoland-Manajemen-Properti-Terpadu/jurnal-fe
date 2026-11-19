import { describe, expect, it } from 'vitest';
import { presetRange } from './saleDateRange';

// Thursday 19 November 2026.
const now = new Date(2026, 10, 19, 15, 30);

describe('presetRange', () => {
  it('gives today, the week from Monday to Sunday, the month and the year', () => {
    expect(presetRange('today', now)).toEqual(['2026-11-19', '2026-11-19']);
    expect(presetRange('week', now)).toEqual(['2026-11-16', '2026-11-22']);
    expect(presetRange('month', now)).toEqual(['2026-11-01', '2026-11-30']);
    expect(presetRange('year', now)).toEqual(['2026-01-01', '2026-12-31']);
  });

  it('starts a Sunday in the week before and crosses a month end', () => {
    expect(presetRange('week', new Date(2026, 10, 1))).toEqual(['2026-10-26', '2026-11-01']);
  });

  it('has no range for "all" and "custom"', () => {
    expect(presetRange('all', now)).toEqual([null, null]);
    expect(presetRange('custom', now)).toEqual([null, null]);
  });
});
