import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import { getPresetDateRange, type PeriodPreset } from '@/module/reports/domain/reportFormat';

export interface ReportPeriodDates {
  startDate: string;
  endDate: string;
}

/**
 * The period of a report page, as `ReportToolbar` edits it: a quick period applies at once, edited
 * dates (`draftPeriod`) apply on `applyDraft`. `onPeriodChange` runs when the applied period
 * changes, for example to stop an export that belongs to the old one.
 */
export function useReportPeriod(initial: PeriodPreset = 'this_month', onPeriodChange?: () => void) {
  const { t } = useTranslation('reports');
  const [preset, setPreset] = useState<PeriodPreset>(initial);
  const [period, setPeriod] = useState<ReportPeriodDates>(() => getPresetDateRange(initial));
  const [draftPeriod, setDraftPeriod] = useState<ReportPeriodDates>(() =>
    getPresetDateRange(initial)
  );

  const selectPreset = (next: PeriodPreset) => {
    setPreset(next);
    if (next === 'custom') return;
    const range = getPresetDateRange(next);
    setDraftPeriod(range);
    setPeriod(range);
    onPeriodChange?.();
  };

  const applyDraft = () => {
    if (draftPeriod.startDate > draftPeriod.endDate) {
      notifications.show({
        color: 'red',
        title: t('common.invalidRangeTitle'),
        message: t('common.invalidRangeMessage'),
      });
      return;
    }
    setPreset('custom');
    setPeriod(draftPeriod);
    onPeriodChange?.();
  };

  return { preset, period, draftPeriod, setDraftPeriod, selectPreset, applyDraft };
}
