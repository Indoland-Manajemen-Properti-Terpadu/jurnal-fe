import { useTranslation } from '@/i18n';

/** Period preset values double as logic keys in the report filters; only the labels are translated. */
export const PERIOD_VALUES = {
  allPeriod: 'All Period',
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  thisYear: 'This Year',
  custom: 'Custom',
} as const;

export const usePeriodOptions = () => {
  const { t } = useTranslation('reports');

  return [
    { value: PERIOD_VALUES.allPeriod, label: t('common.allPeriod') },
    { value: PERIOD_VALUES.today, label: t('common.today') },
    { value: PERIOD_VALUES.yesterday, label: t('common.yesterday') },
    { value: PERIOD_VALUES.thisWeek, label: t('common.thisWeek') },
    { value: PERIOD_VALUES.thisMonth, label: t('common.thisMonth') },
    { value: PERIOD_VALUES.thisYear, label: t('common.thisYear') },
  ];
};
