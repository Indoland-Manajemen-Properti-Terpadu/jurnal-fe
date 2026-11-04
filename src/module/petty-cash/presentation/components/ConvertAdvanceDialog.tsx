import { useState } from 'react';
import { Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { todayWib } from '@/module/petty-cash/domain/wibDate';
import { useTranslation } from '@/i18n';
import type { AdvanceRecord } from '@/module/petty-cash/domain/pettyCashEntities';
import { PocketSelect } from '@/module/petty-cash/presentation/components/PocketSelect';
import { DecisionDialog } from '@/module/petty-cash/presentation/components/DecisionDialog';
import { useConvertAdvance } from '@/module/petty-cash/presentation/hooks/useAdvanceMutations';
import {
  usePettyCashFund,
  usePettyCashLookups,
} from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

interface Props {
  advance: AdvanceRecord;
  opened: boolean;
  onClose: () => void;
}

/** A controller moves an unsettled advance to employee receivable, refilling the fund from the bank. */
export function ConvertAdvanceDialog({ advance, opened, onClose }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const today = todayWib();
  const lookups = usePettyCashLookups();
  const convert = useConvertAdvance(advance.id);
  const [bankAccountId, setBankAccountId] = useState<string | null>(null);
  const [date, setDate] = useState(today);
  const fund = usePettyCashFund(advance.fund.id, opened);
  const [pocket, setPocket] = useState<string | null>(null);

  return (
    <DecisionDialog
      opened={opened}
      title={t('advanceActions.convertTitle', { number: advance.advanceNumber })}
      body={t('advanceActions.convertBody')}
      reasonLabel={t('advanceActions.convertReason')}
      reasonPlaceholder={t('advanceActions.convertPlaceholder')}
      confirmLabel={t('advanceActions.convert')}
      confirmColor="red"
      confirmDisabled={!bankAccountId || !date}
      loading={convert.isPending}
      onClose={onClose}
      onConfirm={(reason) =>
        convert.mutate(
          {
            bankAccountId: bankAccountId as string,
            date,
            reason: reason ?? '',
            ...(pocket ? { pocket } : {}),
          },
          { onSuccess: onClose }
        )
      }
    >
      <Select
        label={t('advanceActions.convertBank')}
        data={(lookups.data?.bankAccounts ?? []).map((account) => ({
          value: account.id,
          label: `${account.accountNumber} · ${account.name}`,
        }))}
        value={bankAccountId}
        onChange={setBankAccountId}
        searchable
        required
      />
      <PocketSelect
        pockets={fund.data?.pockets ?? []}
        value={pocket ?? advance.disbursePocket ?? ''}
        onChange={setPocket}
        label={t('pocketAdmin.refillTo')}
        showBalance={false}
      />
      <DatePickerInput
        label={t('advanceActions.convertDate')}
        value={date || null}
        onChange={(value) => setDate(value ?? '')}
        maxDate={today}
        valueFormat="DD/MM/YYYY"
        required
      />
    </DecisionDialog>
  );
}
