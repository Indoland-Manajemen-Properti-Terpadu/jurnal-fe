import { useMemo, useState, type FormEvent } from 'react';
import { Grid, Select, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconBuildingBank,
  IconCalendar,
  IconCoins,
  IconUser,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  buildReceivePayload,
  buildSentPayload,
  sumLineAmounts,
  balanceAfter,
} from '@/module/bank-cash/domain/transactionPayload';
import {
  balanceAfterReceive,
  receiveMissing,
  receivePreview,
  sentMissing,
  sentPreview,
  todayWib,
} from '@/module/bank-cash/domain/transactionForm';
import { useCashBankChoices } from '@/module/bank-cash/presentation/hooks/useCashBankChoices';
import { usePrefilledAccount } from '@/module/bank-cash/presentation/hooks/usePrefilledAccount';
import { useBankCashTransactionMutation } from '@/module/bank-cash/presentation/hooks/useBankCashTransactionMutation';
import {
  AmountLinesEditor,
  createLineRow,
  type LineRow,
} from '@/module/bank-cash/presentation/components/transaction-form/AmountLinesEditor';
import { AttachmentsField } from '@/module/bank-cash/presentation/components/transaction-form/AttachmentsField';
import { ChoicesLoadError } from '@/module/bank-cash/presentation/components/transaction-form/ChoicesLoadError';
import { FormSection } from '@/module/bank-cash/presentation/components/transaction-form/FormSection';
import { PrefillBlockedNotice } from '@/module/bank-cash/presentation/components/transaction-form/PrefillBlockedNotice';
import { TransactionFormLayout } from '@/module/bank-cash/presentation/components/transaction-form/TransactionFormLayout';
import { TransactionSummaryCard } from '@/module/bank-cash/presentation/components/transaction-form/TransactionSummaryCard';

export type CashLinesKind = 'receive' | 'sent';

/**
 * Receive money and send money are the same form seen from two sides: one cash or bank account,
 * a date, and lines of account and amount. The kind only decides the wording, which side the cash
 * account sits on and how the payload is built.
 */
export function CashLinesForm({ kind }: Readonly<{ kind: CashLinesKind }>) {
  const { t, currentLanguage } = useTranslation('bankCash');
  const navigate = useNavigate();
  const incoming = kind === 'receive';

  const { cashAccounts, sourceOptions, ready, isError } = useCashBankChoices();
  const prefill = usePrefilledAccount(
    incoming ? 'toAccountId' : 'fromAccountId',
    cashAccounts,
    ready
  );

  const [date, setDate] = useState(todayWib);
  const [party, setParty] = useState('');
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<LineRow[]>(() => [createLineRow()]);
  const [files, setFiles] = useState<File[]>([]);
  const { mutate, isPending } = useBankCashTransactionMutation(t(`${kind}.success`));

  const cashOptions = useMemo(
    () =>
      cashAccounts.map((account) => ({
        value: account.id,
        label: t('common.accountOption', {
          name: account.name,
          number: account.accountNumber || '—',
          balance: formatCurrency(account.amount || 0),
        }),
      })),
    [cashAccounts, currentLanguage]
  );

  const selected = cashAccounts.find((account) => account.id === prefill.value);
  const total = sumLineAmounts(rows);
  const missing = (incoming ? receiveMissing : sentMissing)({
    date,
    accountId: prefill.value,
    lines: rows,
  });

  const nameOf = (id: string) => sourceOptions.find((option) => option.value === id)?.label ?? '';
  const named = rows.map((row) => ({ name: nameOf(row.accountId), amount: row.amount }));
  const cashName = selected?.name ?? t('form.notSelected');
  const journal = incoming ? receivePreview(cashName, named) : sentPreview(cashName, named);

  const balance = selected?.amount ?? 0;
  const after = selected
    ? incoming
      ? balanceAfterReceive(balance, total)
      : balanceAfter(balance, total)
    : null;
  const overdraft = !incoming && total > 0 && after !== null && after < 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (missing.length > 0 || !prefill.value) return;
    const items = rows.map((row) => ({
      accountId: row.accountId,
      description: row.description,
      amount: row.amount,
    }));
    const payload = incoming
      ? buildReceivePayload({
          transactionDate: date,
          depositToAccountId: prefill.value,
          depositAccountName: selected?.name,
          payerName: party,
          notes,
          items,
        })
      : buildSentPayload({
          transactionDate: date,
          payFromAccountId: prefill.value,
          payFromAccountName: selected?.name,
          recipientName: party,
          notes,
          items,
        });
    mutate({ ...payload, attachments: files });
  };

  return (
    <TransactionFormLayout
      icon={incoming ? IconArrowDownRight : IconArrowUpRight}
      title={t(`${kind}.title`)}
      description={t(`${kind}.description`)}
      notices={
        <>
          {isError && <ChoicesLoadError />}
          {prefill.blocked && <PrefillBlockedNotice />}
        </>
      }
      onSubmit={handleSubmit}
      main={
        <>
          <FormSection
            icon={<IconBuildingBank size={18} />}
            title={t(`${kind}.detailsTitle`)}
            hint={t(`${kind}.detailsHint`)}
          >
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label={t(`${kind}.accountLabel`)}
                  placeholder={t(`${kind}.accountPlaceholder`)}
                  data={cashOptions}
                  value={prefill.value}
                  onChange={prefill.setValue}
                  searchable
                  nothingFoundMessage={t('common.noCashBankAccount')}
                  comboboxProps={{ shadow: 'md' }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <DateInput
                  label={t(`${kind}.dateLabel`)}
                  valueFormat="DD/MM/YYYY"
                  value={date ? new Date(`${date}T00:00:00`) : null}
                  onChange={(value) => setDate(value ? dayjs(value).format('YYYY-MM-DD') : '')}
                  rightSection={<IconCalendar size={16} color="var(--mantine-color-dimmed)" />}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput
                  label={t(`${kind}.partyLabel`)}
                  placeholder={t(`${kind}.partyPlaceholder`)}
                  leftSection={<IconUser size={15} color="var(--mantine-color-dimmed)" />}
                  value={party}
                  onChange={(event) => setParty(event.currentTarget.value)}
                />
              </Grid.Col>
            </Grid>
          </FormSection>

          <FormSection
            icon={<IconCoins size={18} />}
            title={t(`${kind}.linesTitle`)}
            hint={t(`${kind}.linesHint`)}
          >
            <AmountLinesEditor
              rows={rows}
              onChange={setRows}
              options={sourceOptions}
              labels={{
                account: t(`${kind}.lineAccount`),
                accountPlaceholder: t(`${kind}.lineAccountPlaceholder`),
                description: t(`${kind}.lineDescription`),
                descriptionPlaceholder: t(`${kind}.lineDescriptionPlaceholder`),
                amount: t(`${kind}.amountLabel`),
              }}
            />
            <Textarea
              label={t('form.notes')}
              placeholder={t(`${kind}.notesPlaceholder`)}
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.currentTarget.value)}
            />
          </FormSection>

          <AttachmentsField files={files} onChange={setFiles} />
        </>
      }
      summary={
        <TransactionSummaryCard
          accounts={[
            { role: t(`${kind}.accountRole`), name: selected?.name ?? null, balance, after },
          ]}
          total={{ label: t(`${kind}.total`), amount: total }}
          warning={overdraft ? t('form.overdraft') : null}
          missing={missing.map((reason) => t(`form.missing.${reason}`))}
          journal={journal}
          submitLabel={t(`${kind}.submit`)}
          isPending={isPending}
          onCancel={() => navigate(routes.bankCash.main)}
        />
      }
    />
  );
}
