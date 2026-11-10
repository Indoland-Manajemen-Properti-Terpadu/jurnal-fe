import React from 'react';
import type { PeriodPreset } from '@/module/reports/domain/reportFormat';
import type { TrialBalanceExportType } from '@/module/reports/domain/trialBalance.types';
import type { ReportPeriodDates } from '@/module/reports/presentation/hooks/useReportPeriod';
import { ReportSearchInput } from '@/module/reports/presentation/components/shared/ReportSearchInput';
import { ReportToolbar } from '@/module/reports/presentation/components/shared/ReportToolbar';
import { useTranslation } from '@/i18n';

interface TrialBalanceFilterBarProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  draftPeriod: ReportPeriodDates;
  onDraftPeriodChange: (period: ReportPeriodDates) => void;
  appliedPeriod: ReportPeriodDates;
  onApplyPeriod: () => void;
  isFetching: boolean;
  onRefresh: () => void;
  onExport: (type: TrialBalanceExportType) => void;
  isExporting: boolean;
  onCancelExport: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  hasData: boolean;
}

export const TrialBalanceFilterBar: React.FC<TrialBalanceFilterBarProps> = ({
  searchQuery,
  onSearchQueryChange,
  ...toolbar
}) => {
  const { t } = useTranslation('reports');

  return (
    <ReportToolbar
      {...toolbar}
      extra={
        <ReportSearchInput
          value={searchQuery}
          onChange={onSearchQueryChange}
          placeholder={t('trialBalance.searchAccounts')}
        />
      }
    />
  );
};
