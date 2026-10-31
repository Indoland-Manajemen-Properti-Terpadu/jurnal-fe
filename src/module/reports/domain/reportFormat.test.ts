import { displayDate, formatMoney, getPresetDateRange } from './reportFormat';

describe('getPresetDateRange', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15, 10, 0, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ['this_month', '2026-05-01', '2026-05-15'],
    ['last_month', '2026-04-01', '2026-04-30'],
    ['this_quarter', '2026-04-01', '2026-05-15'],
    ['this_year', '2026-01-01', '2026-05-15'],
    ['custom', '2026-05-01', '2026-05-15'],
  ] as const)('%s runs from %s to %s', (preset, startDate, endDate) => {
    expect(getPresetDateRange(preset)).toEqual({ startDate, endDate });
  });

  it('last_month crosses the year boundary in January', () => {
    vi.setSystemTime(new Date(2026, 0, 10));

    expect(getPresetDateRange('last_month')).toEqual({
      startDate: '2025-12-01',
      endDate: '2025-12-31',
    });
  });
});

describe('displayDate', () => {
  it('formats an ISO date or datetime as dd/mm/yyyy', () => {
    expect(displayDate('2026-05-15')).toBe('15/05/2026');
    expect(displayDate('2026-05-15T08:00:00.000Z')).toBe('15/05/2026');
  });

  it('shows a dash for empty values and returns unparseable text untouched', () => {
    expect(displayDate(null)).toBe('-');
    expect(displayDate(undefined)).toBe('-');
    expect(displayDate('soon')).toBe('soon');
  });
});

describe('formatMoney', () => {
  it('formats rupiah without fraction digits for whole amounts and treats missing as 0', () => {
    expect(formatMoney(1500)).toMatch(/1\.500$/);
    expect(formatMoney(undefined as unknown as number)).toMatch(/0$/);
  });
});
