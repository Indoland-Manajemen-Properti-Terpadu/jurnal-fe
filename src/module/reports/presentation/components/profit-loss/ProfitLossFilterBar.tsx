import React from 'react';
import type { ProfitLossExportType } from '@/module/reports/domain/profitLoss.types';
import type { PeriodPreset } from '@/module/reports/domain/reportFormat';
import type { ReportPeriodDates } from '@/module/reports/presentation/hooks/useReportPeriod';
import { ReportSearchInput } from '@/module/reports/presentation/components/shared/ReportSearchInput';
import { ReportToolbar } from '@/module/reports/presentation/components/shared/ReportToolbar';

import { useTranslation } from '@/i18n';

interface ProfitLossFilterBarProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  draftPeriod: ReportPeriodDates;
  onDraftPeriodChange: (period: ReportPeriodDates) => void;
  appliedPeriod: ReportPeriodDates;
  onApplyPeriod: () => void;
  isFetching: boolean;
  onRefresh: () => void;
  onExport: (type: ProfitLossExportType) => void;
  isExporting: boolean;
  onCancelExport: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  hasData: boolean;
}

export const ProfitLossFilterBar: React.FC<ProfitLossFilterBarProps> = ({
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
          placeholder={t('profitLoss.searchAccounts')}
        />
      }
    />
  );
};
