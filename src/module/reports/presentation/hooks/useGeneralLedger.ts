import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { generalLedgerApi } from '@/module/reports/infrastructure/generalLedgerApi';
import type {
  GeneralLedgerExportType,
  GeneralLedgerReport,
  ReportPeriod,
} from '@/module/reports/domain/generalLedger.types';
import { getPresetDateRange, type PeriodPreset } from '@/module/reports/domain/reportFormat';

import { useTranslation } from '@/i18n';

export function useGeneralLedger() {
  const { t } = useTranslation('reports');
  const [preset, setPreset] = useState<PeriodPreset>('this_month');
  const [period, setPeriod] = useState<ReportPeriod>(() => getPresetDateRange('this_month'));
  const [draftPeriod, setDraftPeriod] = useState<ReportPeriod>(() =>
    getPresetDateRange('this_month')
  );

  const [viewMode, setViewMode] = useState<'master_detail' | 'consolidated'>('master_detail');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [accountSearch, setAccountSearch] = useState('');
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionSort, setTransactionSort] = useState<'asc' | 'desc'>('asc');

  // Change preset helper
  const handlePresetChange = (newPreset: PeriodPreset) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      const range = getPresetDateRange(newPreset);
      setDraftPeriod(range);
      setPeriod(range);
      setSelectedAccountId(null);
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
    setSelectedAccountId(null);
  };

  // Query
  const query = useQuery<GeneralLedgerReport>({
    queryKey: ['general-ledger', period.startDate, period.endDate],
    queryFn: () => generalLedgerApi.getReport(period),
    staleTime: 60_000,
  });

  const accounts = query.data?.accounts ?? [];

  // Filtered accounts based on search
  const filteredAccounts = useMemo(() => {
    const term = accountSearch.trim().toLowerCase();
    if (!term) return accounts;
    return accounts.filter(
      (acc) =>
        acc.number.toLowerCase().includes(term) ||
        acc.name.toLowerCase().includes(term) ||
        acc.category.toLowerCase().includes(term)
    );
  }, [accounts, accountSearch]);

  // Selected account
  const selectedAccount = useMemo(() => {
    if (selectedAccountId) {
      const found = accounts.find((a) => a.id === selectedAccountId);
      if (found) return found;
    }
    return filteredAccounts[0] || accounts[0] || null;
  }, [accounts, filteredAccounts, selectedAccountId]);

  // Transactions within selected account, filtered & sorted
  const accountTransactions = useMemo(() => {
    if (!selectedAccount) return [];
    let list = [...selectedAccount.transactions];

    const term = transactionSearch.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (tx) =>
          tx.transactionNumber.toLowerCase().includes(term) ||
          tx.description.toLowerCase().includes(term)
      );
    }

    list.sort((a, b) => {
      const dateA = a.transactionDate || '';
      const dateB = b.transactionDate || '';
      if (transactionSort === 'asc') return dateA.localeCompare(dateB);
      return dateB.localeCompare(dateA);
    });

    return list;
  }, [selectedAccount, transactionSearch, transactionSort]);

  // Total transactions count
  const totalTransactionsCount = useMemo(
    () => accounts.reduce((acc, curr) => acc + curr.transactions.length, 0),
    [accounts]
  );

  // Check debit-credit balance
  const isBalanced = useMemo(() => {
    if (!query.data) return true;
    const diff = Math.abs(query.data.periodDebitTotal - query.data.periodCreditTotal);
    return diff < 0.01;
  }, [query.data]);

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (type: GeneralLedgerExportType) => generalLedgerApi.exportReport(period, type),
    onSuccess: (blob, type) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `buku-besar_${period.startDate}_sd_${period.endDate}.${type}`;
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
      notifications.show({
        color: 'red',
        title: t('common.exportFailed'),
        message: err instanceof Error ? err.message : t('generalLedger.exportFailedMessage'),
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

    query,
    accounts,
    filteredAccounts,
    selectedAccount,
    selectedAccountId,
    setSelectedAccountId,

    accountSearch,
    setAccountSearch,

    transactionSearch,
    setTransactionSearch,
    transactionSort,
    setTransactionSort,
    accountTransactions,

    totalTransactionsCount,
    isBalanced,

    exportMutation,
  };
}
