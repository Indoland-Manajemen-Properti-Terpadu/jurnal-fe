import { useState } from 'react';
import { NumberInput, Select, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { todayWib } from '@/module/petty-cash/domain/wibDate';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  paguDirection,
  toPaguInput,
  validatePaguAdjustment,
  type PaguAdjustmentDraft,
} from '@/module/petty-cash/domain/fundAdmin';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { PocketSelect } from '@/module/petty-cash/presentation/components/PocketSelect';
import { DecisionDialog } from '@/module/petty-cash/presentation/components/DecisionDialog';
import { useAdjustPagu } from '@/module/petty-cash/presentation/hooks/useFundMutations';
import { usePettyCashLookups } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

const money = (amount: number) => formatCurrency(amount, false);

/** Moves the ceiling up or down; the journal runs against the bank account chosen here. */
export function AdjustPaguDialog({
  fund,
  opened,
  onClose,
}: Readonly<{ fund: PettyCashFund; opened: boolean; onClose: () => void }>) {
  const { t } = useTranslation('pettyCash');
  const today = todayWib();
  const lookups = usePettyCashLookups();
  const adjust = useAdjustPagu(fund.id);
  const [draft, setDraft] = useState<PaguAdjustmentDraft>({
    newPagu: '',
    pocket: null,
    bankAccountId: null,
    date: today,
    reason: '',
  });
  const [touched, setTouched] = useState(false);

  const issues = validatePaguAdjustment(draft, fund.pagu, today);
  const errorOf = (path: string) => {
    const issue = issues.find((item) => item.path === path);
    return touched && issue ? t(`fundAdmin.issue.${issue.code}`) : undefined;
  };
  const direction = paguDirection(fund.pagu, draft.newPagu === '' ? fund.pagu : draft.newPagu);

  return (
    <DecisionDialog
      opened={opened}
      title={t('fundAdmin.adjustTitle', { name: fund.name })}
      body={t('fundAdmin.adjustBody', { pagu: money(fund.pagu) })}
      reasonLabel={t('fundAdmin.adjustReason')}
      confirmLabel={t('fundAdmin.adjust')}
      loading={adjust.isPending}
      onClose={() => {
        setTouched(false);
        onClose();
      }}
      onConfirm={(reason) => {
        const next = { ...draft, reason: reason ?? '' };
        setDraft(next);
        setTouched(true);
        if (validatePaguAdjustment(next, fund.pagu, today).length > 0) return;
        adjust.mutate(toPaguInput(next), { onSuccess: onClose });
      }}
    >
      <NumberInput
        label={t('fundAdmin.newPagu')}
        value={draft.newPagu}
        onChange={(value) => setDraft({ ...draft, newPagu: value === '' ? '' : Number(value) })}
        error={errorOf('newPagu')}
        thousandSeparator="."
        decimalSeparator=","
        allowNegative={false}
        decimalScale={0}
        leftSection={<Text size="sm">Rp</Text>}
        required
      />
      {direction.kind !== 'NONE' && (
        <Text size="sm" c="dimmed" aria-live="polite">
          {t(
            direction.kind === 'INCREASE' ? 'fundAdmin.adjustIncrease' : 'fundAdmin.adjustDecrease',
            { amount: money(direction.amount) }
          )}
        </Text>
      )}
      <PocketSelect
        pockets={fund.pockets}
        value={draft.pocket ?? ''}
        onChange={(pocket) => setDraft({ ...draft, pocket })}
        label={t(direction.kind === 'DECREASE' ? 'pocketAdmin.takenFrom' : 'pocketAdmin.addedTo')}
      />
      <Select
        label={t('fundAdmin.adjustBank')}
        data={(lookups.data?.bankAccounts ?? []).map((account) => ({
          value: account.id,
          label: `${account.accountNumber} · ${account.name}`,
        }))}
        value={draft.bankAccountId}
        onChange={(bankAccountId) => setDraft({ ...draft, bankAccountId })}
        error={errorOf('bankAccountId')}
        searchable
        required
      />
      <DatePickerInput
        label={t('fundAdmin.adjustDate')}
        value={draft.date || null}
        onChange={(value) => setDraft({ ...draft, date: value ?? '' })}
        maxDate={today}
        valueFormat="DD/MM/YYYY"
        error={errorOf('date')}
        required
      />
    </DecisionDialog>
  );
}
