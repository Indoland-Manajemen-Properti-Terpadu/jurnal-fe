import { daysLate } from './payablesView';

describe('daysLate', () => {
  it('counts the days after the due date', () => {
    expect(daysLate('2026-10-25T00:00:00.000Z', '2026-11-04')).toBe(10);
  });

  it('is 0 on the due date, before it, or without a due date', () => {
    expect(daysLate('2026-11-04', '2026-11-04')).toBe(0);
    expect(daysLate('2026-12-03', '2026-11-04')).toBe(0);
    expect(daysLate(null, '2026-11-04')).toBe(0);
  });
});
