import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { endOfYear, format, startOfYear, subYears } from 'date-fns';
import { generalLedgerApi } from '@/module/reports/infrastructure/generalLedgerApi';
import { generalLedgerCsv } from '@/module/reports/infrastructure/generalLedgerCsv';
import { isRequestCanceled } from '@/module/reports/infrastructure/requestCancel';
import { useAbortableRequest } from '@/module/reports/presentation/hooks/useAbortableRequest';
import type {
  GeneralLedgerExportType,
  GeneralLedgerReport,
  ReportPeriod,
} from '@/module/reports/domain/generalLedger.types';
import { getPresetDateRange, type PeriodPreset } from '@/module/reports/domain/reportFormat';
import {
  countPeriodJournals,
  periodDifference,
  selectLedgerAccounts,
} from '@/module/reports/domain/generalLedgerView';

import { useTranslation } from '@/i18n';

export type GeneralLedgerPreset = PeriodPreset | 'last_year';

export function useGeneralLedger() {
  const { t } = useTranslation('reports');
  const exportRequest = useAbortableRequest();
  const [preset, setPreset] = useState<GeneralLedgerPreset>('this_month');
  const [period, setPeriod] = useState<ReportPeriod>(() => getPresetDateRange('this_month'));
  const [accountSearch, setAccountSearch] = useState('');
  const [hideWithoutTransactions, setHideWithoutTransactions] = useState(true);

  // Change preset helper
  const handlePresetChange = (newPreset: GeneralLedgerPreset) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      const previousYear = subYears(new Date(), 1);
      const range =
        newPreset === 'last_year'
          ? {
              startDate: format(startOfYear(previousYear), 'yyyy-MM-dd'),
              endDate: format(endOfYear(previousYear), 'yyyy-MM-dd'),
            }
          : getPresetDateRange(newPreset);
      setPeriod(range);
      exportRequest.abort();
    }
  };

  const handleCustomPeriod = (range: ReportPeriod) => {
    if (range.startDate > range.endDate) {
      notifications.show({
        color: 'red',
        title: t('common.invalidRangeTitle'),
        message: t('common.invalidRangeMessage'),
      });
      return;
    }
    setPreset('custom');
    setPeriod(range);
    exportRequest.abort();
  };

  // Query
  const query = useQuery<GeneralLedgerReport>({
    queryKey: ['general-ledger', period.startDate, period.endDate],
    queryFn: ({ signal }) => generalLedgerApi.getReport(period, signal),
    staleTime: 60_000,
  });

  const accounts = query.data?.accounts ?? [];

  const filteredAccounts = useMemo(
    () => selectLedgerAccounts(accounts, accountSearch, hideWithoutTransactions),
    [accounts, accountSearch, hideWithoutTransactions]
  );
  const activeAccountCount = accounts.filter((account) => account.transactions.length > 0).length;
  const journalCount = countPeriodJournals(accounts);

  // Check debit-credit balance
  const difference = useMemo(
    () =>
      query.data ? periodDifference(query.data.periodDebitTotal, query.data.periodCreditTotal) : 0,
    [query.data]
  );
  const isBalanced = difference === 0;

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (type: GeneralLedgerExportType) => {
      const exportAccounts = hideWithoutTransactions
        ? accounts.filter((account) => account.transactions.length > 0)
        : accounts;
      if (type === 'csv') {
        const csv = generalLedgerCsv(exportAccounts, query.data?.precision ?? 2, {
          columns: [
            t('generalLedger.csvCategory'),
            t('generalLedger.csvAccountCode'),
            t('generalLedger.csvAccountName'),
            t('common.date'),
            t('generalLedger.colReference'),
            t('generalLedger.colDescription'),
            t('generalLedger.csvNotes'),
            t('common.debit'),
            t('common.creditId'),
            t('generalLedger.colRunningBalance'),
          ],
          opening: t('generalLedger.openingBalance'),
          closing: t('generalLedger.closingBalance'),
        });
        return Promise.resolve(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      }
      return generalLedgerApi.exportReport(
        period,
        type,
        exportRequest.start(),
        hideWithoutTransactions ? exportAccounts.map((account) => account.id) : undefined
      );
    },
    onSuccess: (blob, type) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `buku-besar-${period.startDate}_${period.endDate}.${type}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);

      notifications.show({
        color: 'teal',
        title: t('common.exportSuccess'),
        message: t('generalLedger.fileDownloaded', { type: type.toUpperCase() }),
      });
    },
    onError: (err) => {
      if (isRequestCanceled(err)) return;
      notifications.show({
        color: 'red',
        title: t('common.exportFailed'),
        message: err instanceof Error ? err.message : t('generalLedger.exportFailedMessage'),
      });
    },
  });

  const cancelExport = () => {
    exportRequest.abort();
    notifications.show({ color: 'gray', message: t('common.exportCanceled') });
  };

  return {
    period,
    preset,
    handlePresetChange,
    handleCustomPeriod,

    query,
    accounts,
    filteredAccounts,
    activeAccountCount,
    journalCount,

    accountSearch,
    setAccountSearch,
    hideWithoutTransactions,
    setHideWithoutTransactions,

    isBalanced,
    difference,

    exportMutation,
    cancelExport,
  };
}
