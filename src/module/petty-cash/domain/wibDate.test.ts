import { todayWib } from '@/module/petty-cash/domain/wibDate';

describe('todayWib', () => {
  it('reads the calendar date in Jakarta, not in UTC', () => {
    // 17:30 UTC on 3 Nov is already 00:30 on 4 Nov in Jakarta (UTC+7).
    expect(todayWib(new Date('2026-11-03T17:30:00.000Z'))).toBe('2026-11-04');
  });

  it('keeps the same date before the Jakarta midnight', () => {
    expect(todayWib(new Date('2026-11-03T16:59:00.000Z'))).toBe('2026-11-03');
  });

  it('is always an ISO calendar date', () => {
    expect(todayWib()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
