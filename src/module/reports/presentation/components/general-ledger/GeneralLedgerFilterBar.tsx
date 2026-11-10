import React from 'react';
import type {
  GeneralLedgerExportType,
  ReportPeriod,
} from '@/module/reports/domain/generalLedger.types';
import type { PeriodPreset } from '@/module/reports/domain/reportFormat';
import { ReportSearchInput } from '@/module/reports/presentation/components/shared/ReportSearchInput';
import { ReportToolbar } from '@/module/reports/presentation/components/shared/ReportToolbar';

import { useTranslation } from '@/i18n';

interface GeneralLedgerFilterBarProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  draftPeriod: ReportPeriod;
  onDraftPeriodChange: (period: ReportPeriod) => void;
  appliedPeriod: ReportPeriod;
  onApplyPeriod: () => void;
  isFetching: boolean;
  onRefresh: () => void;
  onExport: (type: GeneralLedgerExportType) => void;
  isExporting: boolean;
  onCancelExport: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  hasData: boolean;
}

export const GeneralLedgerFilterBar: React.FC<GeneralLedgerFilterBarProps> = ({
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
          placeholder={t('generalLedger.searchAccounts')}
        />
      }
    />
  );
};
