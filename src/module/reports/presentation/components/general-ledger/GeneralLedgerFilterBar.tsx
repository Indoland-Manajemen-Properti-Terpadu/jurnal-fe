import React from 'react';
import type {
  GeneralLedgerExportType,
  ReportPeriod,
} from '@/module/reports/domain/generalLedger.types';
import type { PeriodPreset } from '@/module/reports/domain/reportFormat';
import { ReportToolbar } from '@/module/reports/presentation/components/shared/ReportToolbar';

interface GeneralLedgerFilterBarProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  draftPeriod: ReportPeriod;
  onDraftPeriodChange: (period: ReportPeriod) => void;
  onApplyPeriod: () => void;
  isFetching: boolean;
  onExport: (type: GeneralLedgerExportType) => void;
  isExporting: boolean;
  onCancelExport: () => void;
  hasData: boolean;
}

export const GeneralLedgerFilterBar: React.FC<GeneralLedgerFilterBarProps> = (props) => (
  <ReportToolbar {...props} />
);
