import { describe, expect, it } from 'vitest';
import { overviewMonthLabels } from './salesOverviewFormat';

describe('overviewMonthLabels', () => {
  it('uses the Jakarta day at the UTC month boundary', () => {
    const labels = overviewMonthLabels('2026-11-30T17:30:00.000Z', 'id');

    expect(labels.currentMonth).toBe('Des 2026');
    expect(labels.monthKey).toBe('2026-12');
    expect(labels.currentRange).toBe('1–1 Des');
    expect(labels.previousComparableRange).toBe('1–1 Nov');
  });

  it('also crosses the year boundary in Jakarta', () => {
    const labels = overviewMonthLabels('2026-12-31T17:30:00.000Z', 'id');

    expect(labels.currentMonth).toBe('Jan 2027');
    expect(labels.previousMonth).toBe('Des 2026');
  });
});
