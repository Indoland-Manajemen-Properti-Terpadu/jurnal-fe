import { useState } from 'react';
import { Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { todayWib } from '@/module/petty-cash/domain/wibDate';
import { useTranslation } from '@/i18n';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { DecisionDialog } from '@/module/petty-cash/presentation/components/DecisionDialog';
import { useCloseFund } from '@/module/petty-cash/presentation/hooks/useFundMutations';
import { usePettyCashLookups } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

/** Closing returns the ceiling to the bank; the backend refuses while anything is still open. */
export function CloseFundDialog({
  fund,
  opened,
  onClose,
}: Readonly<{ fund: PettyCashFund; opened: boolean; onClose: () => void }>) {
  const { t } = useTranslation('pettyCash');
  const today = todayWib();
  const lookups = usePettyCashLookups();
  const close = useCloseFund(fund.id);
  const [bankAccountId, setBankAccountId] = useState<string | null>(null);
  const [date, setDate] = useState(today);

  return (
    <DecisionDialog
      opened={opened}
      title={t('fundAdmin.closeTitle', { name: fund.name })}
      body={t('fundAdmin.closeBody')}
      reasonLabel={t('fundAdmin.closeReason')}
      confirmLabel={t('fundAdmin.closeConfirm')}
      confirmColor="red"
      confirmDisabled={!bankAccountId || !date}
      loading={close.isPending}
      onClose={onClose}
      onConfirm={(reason) =>
        close.mutate(
          { bankAccountId: bankAccountId as string, date, reason: reason ?? '' },
          { onSuccess: onClose }
        )
      }
    >
      <Select
        label={t('fundAdmin.closeBank')}
        data={(lookups.data?.bankAccounts ?? []).map((account) => ({
          value: account.id,
          label: `${account.accountNumber} · ${account.name}`,
        }))}
        value={bankAccountId}
        onChange={setBankAccountId}
        searchable
        required
      />
      <DatePickerInput
        label={t('fundAdmin.closeDate')}
        value={date || null}
        onChange={(value) => setDate(value ?? '')}
        maxDate={today}
        valueFormat="DD/MM/YYYY"
        required
      />
    </DecisionDialog>
  );
}
