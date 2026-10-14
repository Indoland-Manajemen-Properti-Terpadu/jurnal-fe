import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { format, startOfMonth } from 'date-fns';
import { getGeneralLedger } from '../../application/use-cases/getGeneralLedger';
import { exportGeneralLedger } from '../../application/use-cases/exportGeneralLedger';
import type { GeneralLedgerExportType, ReportPeriod } from '../../domain/entities/generalLedger';
import type { GeneralLedgerRepository } from '../../domain/repositories/generalLedgerRepository';

function currentPeriod(): ReportPeriod {
  const today = new Date();
  return { startDate: format(startOfMonth(today), 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') };
}

export function useGeneralLedgerReport(repository: GeneralLedgerRepository) {
  const [period, setPeriod] = useState<ReportPeriod>(currentPeriod);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [accountSearch, setAccountSearch] = useState('');

  const query = useQuery({
    queryKey: ['reports', 'general-ledger', period.startDate, period.endDate],
    queryFn: () => getGeneralLedger(repository, period),
  });

  const accounts = query.data?.accounts ?? [];
  const selectedAccount = accounts.find((account) => account.id === selectedAccountId)
    ?? accounts[0] ?? null;
  const filteredAccounts = useMemo(() => {
    const term = accountSearch.trim().toLocaleLowerCase('id-ID');
    if (!term) return accounts;
    return accounts.filter((account) => `${account.number} ${account.name} ${account.category}`.toLocaleLowerCase('id-ID').includes(term));
  }, [accounts, accountSearch]);

  const exportMutation = useMutation({
    mutationFn: (type: GeneralLedgerExportType) => exportGeneralLedger(repository, period, type),
    onSuccess: (blob, type) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `general-ledger-${period.startDate}_${period.endDate}.${type}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      notifications.show({ color: 'primary', title: 'Ekspor siap', message: 'File buku besar sedang diunduh.' });
    },
    onError: (error) => notifications.show({
      color: 'red',
      title: 'Ekspor gagal',
      message: error.message,
    }),
  });

  return {
    period,
    setPeriod,
    query,
    accounts,
    selectedAccount,
    setSelectedAccountId,
    accountSearch,
    setAccountSearch,
    filteredAccounts,
    exportMutation,
  };
}
