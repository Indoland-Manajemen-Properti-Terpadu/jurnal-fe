import { act, renderHook } from '@testing-library/react';
import { getPresetDateRange } from '@/module/reports';
import { emptyHistoryFilters, type JournalHistoryFilters } from '../../domain/journalHistory';
import { detectPreset, useJournalPeriod, withDefaultPeriod } from './useJournalPeriod';

const withDates = (startDate: string, endDate: string): JournalHistoryFilters => ({
  ...emptyHistoryFilters(),
  startDate,
  endDate,
});

describe('detectPreset', () => {
  it('recognises the dates of a quick period', () => {
    expect(detectPreset(getPresetDateRange('last_month'))).toBe('last_month');
    expect(detectPreset(getPresetDateRange('this_year'))).toBe('this_year');
  });

  it('calls any other dates custom', () => {
    expect(detectPreset({ startDate: '2020-01-02', endDate: '2020-01-09' })).toBe('custom');
  });
});

describe('withDefaultPeriod', () => {
  it('gives a list without dates this month, and keeps dates it has', () => {
    expect(withDefaultPeriod(emptyHistoryFilters())).toMatchObject(
      getPresetDateRange('this_month')
    );
    const dated = withDates('2020-01-02', '2020-01-09');
    expect(withDefaultPeriod(dated)).toBe(dated);
  });
});

describe('useJournalPeriod', () => {
  it('applies a quick period at once', () => {
    const update = vi.fn();
    const filters = withDefaultPeriod(emptyHistoryFilters());
    const { result } = renderHook(() => useJournalPeriod(filters, update));
    expect(result.current.preset).toBe('this_month');

    act(() => result.current.selectPreset('this_quarter'));
    expect(update).toHaveBeenLastCalledWith(getPresetDateRange('this_quarter'));
  });

  it('keeps custom while dates are edited and applies them only on apply', () => {
    const update = vi.fn();
    const { result } = renderHook(() => useJournalPeriod(emptyHistoryFilters(), update));

    act(() => result.current.selectPreset('custom'));
    expect(result.current.preset).toBe('custom');
    expect(update).not.toHaveBeenCalled();

    act(() => result.current.setDraft({ startDate: '2020-01-02', endDate: '2020-01-09' }));
    expect(update).not.toHaveBeenCalled();
    act(() => result.current.apply());
    expect(update).toHaveBeenCalledWith({ startDate: '2020-01-02', endDate: '2020-01-09' });
  });

  it('does not apply half a range', () => {
    const update = vi.fn();
    const { result } = renderHook(() => useJournalPeriod(withDates('', ''), update));
    act(() => result.current.setDraft({ startDate: '2020-01-02', endDate: '' }));
    act(() => result.current.apply());
    expect(update).not.toHaveBeenCalled();
  });
});
