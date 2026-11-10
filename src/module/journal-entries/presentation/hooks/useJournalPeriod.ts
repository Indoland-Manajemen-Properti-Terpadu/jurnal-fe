import { useEffect, useState } from 'react';
import { getPresetDateRange, type PeriodPreset } from '@/module/reports';
import type { JournalHistoryFilters } from '../../domain/journalHistory';

type Period = { startDate: string; endDate: string };

const QUICK_PRESETS: PeriodPreset[] = ['this_month', 'last_month', 'this_quarter', 'this_year'];

/** The list always has a period (the export needs one): an address without dates means this month. */
export const withDefaultPeriod = (filters: JournalHistoryFilters): JournalHistoryFilters =>
  filters.startDate || filters.endDate
    ? filters
    : { ...filters, ...getPresetDateRange('this_month') };

/** The quick period whose dates the list shows; `custom` when none of them matches. */
export const detectPreset = (applied: Period): PeriodPreset =>
  QUICK_PRESETS.find((preset) => {
    const range = getPresetDateRange(preset);
    return range.startDate === applied.startDate && range.endDate === applied.endDate;
  }) ?? 'custom';

/**
 * Period state for the general journal's report toolbar. The dates in the address are the applied
 * period; the toolbar edits a draft that applies on "Apply", while a quick period applies at once.
 */
export function useJournalPeriod(
  filters: JournalHistoryFilters,
  update: (patch: Partial<JournalHistoryFilters>) => void
) {
  const applied: Period = { startDate: filters.startDate, endDate: filters.endDate };
  const [draft, setDraft] = useState<Period>(applied);
  // Picking "Custom" or editing a date keeps that choice until the dates are applied.
  const [editing, setEditing] = useState(false);

  // The address changes from outside too (back button, a shared link).
  useEffect(() => {
    setDraft({ startDate: filters.startDate, endDate: filters.endDate });
    setEditing(false);
  }, [filters.startDate, filters.endDate]);

  const selectPreset = (preset: PeriodPreset) => {
    if (preset === 'custom') {
      setEditing(true);
      return;
    }
    setEditing(false);
    update(getPresetDateRange(preset));
  };

  const apply = () => {
    if (!draft.startDate || !draft.endDate) return;
    setEditing(false);
    update({ startDate: draft.startDate, endDate: draft.endDate });
  };

  return {
    preset: editing ? ('custom' as const) : detectPreset(applied),
    selectPreset,
    draft,
    setDraft,
    applied,
    apply,
  };
}
