import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { balanceSheetApi } from '@/module/reports/infrastructure/balanceSheetApi';
import type {
  BalanceSheetAccountItem,
  BalanceSheetData,
  BalanceSheetExportType,
  BalanceSheetQueryParams,
} from '@/module/reports/domain/balanceSheet.types';
import { getPresetDateRange, type PeriodPreset } from '@/module/reports/domain/reportFormat';

import { useTranslation } from '@/i18n';

export function useBalanceSheet() {
  const { t } = useTranslation('reports');
  const [preset, setPreset] = useState<PeriodPreset>('this_month');
  const [period, setPeriod] = useState<BalanceSheetQueryParams>(() =>
    getPresetDateRange('this_month')
  );
  const [draftPeriod, setDraftPeriod] = useState<BalanceSheetQueryParams>(() =>
    getPresetDateRange('this_month')
  );

  const [viewMode, setViewMode] = useState<'standard' | 'side_by_side'>('side_by_side');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle preset change
  const handlePresetChange = (newPreset: PeriodPreset) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      const range = getPresetDateRange(newPreset);
      setDraftPeriod(range);
      setPeriod(range);
    }
  };

  // Apply custom dates
  const handleApplyCustomPeriod = () => {
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
  };

  // Query
  const query = useQuery<BalanceSheetData>({
    queryKey: ['balance-sheet-report', period.startDate, period.endDate],
    queryFn: () => balanceSheetApi.getReport(period),
    staleTime: 60_000,
  });

  const { data } = query;

  // Filter accounts helper
  const filterAccounts = (accounts: BalanceSheetAccountItem[]): BalanceSheetAccountItem[] => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return accounts;
    return accounts.filter((item) => {
      const name = item.accountName.toLowerCase();
      const num = (item.accountNumber || '').toLowerCase();
      const cat = (item.categoryName || '').toLowerCase();
      return name.includes(term) || num.includes(term) || cat.includes(term);
    });
  };

  // Filtered Assets
  const filteredCurrentAssets = useMemo(
    () => filterAccounts(data?.assets.currentAssets ?? []),
    [data?.assets.currentAssets, searchQuery]
  );
  const filteredNonCurrentAssets = useMemo(
    () => filterAccounts(data?.assets.nonCurrentAssets ?? []),
    [data?.assets.nonCurrentAssets, searchQuery]
  );
  const filteredDepreciation = useMemo(
    () => filterAccounts(data?.assets.depreciationAmortization ?? []),
    [data?.assets.depreciationAmortization, searchQuery]
  );

  // Filtered Liabilities
  const filteredCurrentLiabilities = useMemo(
    () => filterAccounts(data?.liabilities.currentLiabilities ?? []),
    [data?.liabilities.currentLiabilities, searchQuery]
  );
  const filteredNonCurrentLiabilities = useMemo(
    () => filterAccounts(data?.liabilities.nonCurrentLiabilities ?? []),
    [data?.liabilities.nonCurrentLiabilities, searchQuery]
  );
  const filteredAllLiabilities = useMemo(
    () => filterAccounts(data?.liabilities.allLiabilities ?? []),
    [data?.liabilities.allLiabilities, searchQuery]
  );

  // Filtered Equity
  const filteredEquity = useMemo(
    () => filterAccounts(data?.equity ?? []),
    [data?.equity, searchQuery]
  );

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (type: BalanceSheetExportType) => balanceSheetApi.exportReport(period, type),
    onSuccess: (blob, type) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `neraca_${period.startDate}_sd_${period.endDate}.${type}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);

      notifications.show({
        color: 'teal',
        title: t('common.exportSuccess'),
        message: `File Laporan Neraca (${type.toUpperCase()}) telah diunduh.`,
      });
    },
    onError: (err) => {
      notifications.show({
        color: 'red',
        title: t('common.exportFailed'),
        message: err instanceof Error ? err.message : t('balanceSheet.exportFailedMessage'),
      });
    },
  });

  return {
    period,
    draftPeriod,
    setDraftPeriod,
    preset,
    handlePresetChange,
    handleApplyCustomPeriod,

    viewMode,
    setViewMode,

    searchQuery,
    setSearchQuery,

    query,
    data,

    filteredCurrentAssets,
    filteredNonCurrentAssets,
    filteredDepreciation,
    filteredCurrentLiabilities,
    filteredNonCurrentLiabilities,
    filteredAllLiabilities,
    filteredEquity,

    exportMutation,
  };
}
