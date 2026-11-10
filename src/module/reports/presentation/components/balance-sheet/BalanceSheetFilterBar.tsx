import React from 'react';
import type {
  BalanceSheetExportType,
  BalanceSheetQueryParams,
} from '@/module/reports/domain/balanceSheet.types';
import type { PeriodPreset } from '@/module/reports/domain/reportFormat';
import { ReportSearchInput } from '@/module/reports/presentation/components/shared/ReportSearchInput';
import { ReportToolbar } from '@/module/reports/presentation/components/shared/ReportToolbar';

import { useTranslation } from '@/i18n';

interface BalanceSheetFilterBarProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  draftPeriod: BalanceSheetQueryParams;
  onDraftPeriodChange: (period: BalanceSheetQueryParams) => void;
  appliedPeriod: BalanceSheetQueryParams;
  onApplyPeriod: () => void;
  isFetching: boolean;
  onRefresh: () => void;
  onExport: (type: BalanceSheetExportType) => void;
  isExporting: boolean;
  onCancelExport: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  hasData: boolean;
}

export const BalanceSheetFilterBar: React.FC<BalanceSheetFilterBarProps> = ({
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
          placeholder={t('balanceSheet.searchAccounts')}
        />
      }
    />
  );
};
