import { useState } from 'react';
import { Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useTranslation } from '@/i18n';
import type { AdvanceRecord } from '@/module/petty-cash/domain/pettyCashEntities';
import { DecisionDialog } from '@/module/petty-cash/presentation/components/DecisionDialog';
import { useConvertAdvance } from '@/module/petty-cash/presentation/hooks/useAdvanceMutations';
import { usePettyCashLookups } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

interface Props {
  advance: AdvanceRecord;
  opened: boolean;
  onClose: () => void;
}

/** A controller moves an unsettled advance to employee receivable, refilling the fund from the bank. */
export function ConvertAdvanceDialog({ advance, opened, onClose }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const today = dayjs().format('YYYY-MM-DD');
  const lookups = usePettyCashLookups();
  const convert = useConvertAdvance(advance.id);
  const [bankAccountId, setBankAccountId] = useState<string | null>(null);
  const [date, setDate] = useState(today);

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
          { bankAccountId: bankAccountId as string, date, reason: reason ?? '' },
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
