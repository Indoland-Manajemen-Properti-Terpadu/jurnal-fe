import { useMemo, useState, type FormEvent } from 'react';
import { Grid, NumberInput, Select, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconArrowsExchange, IconCalendar, IconCoins, IconBuildingBank } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { balanceAfter, buildTransferPayload } from '@/module/bank-cash/domain/transactionPayload';
import {
  balanceAfterReceive,
  todayWib,
  transferMissing,
  transferPreview,
} from '@/module/bank-cash/domain/transactionForm';
import { useCashBankChoices } from '@/module/bank-cash/presentation/hooks/useCashBankChoices';
import { usePrefilledAccount } from '@/module/bank-cash/presentation/hooks/usePrefilledAccount';
import { useBankCashTransactionMutation } from '@/module/bank-cash/presentation/hooks/useBankCashTransactionMutation';
import { AttachmentsField } from '@/module/bank-cash/presentation/components/transaction-form/AttachmentsField';
import { ChoicesLoadError } from '@/module/bank-cash/presentation/components/transaction-form/ChoicesLoadError';
import { FormSection } from '@/module/bank-cash/presentation/components/transaction-form/FormSection';
import { PrefillBlockedNotice } from '@/module/bank-cash/presentation/components/transaction-form/PrefillBlockedNotice';
import { TransactionFormLayout } from '@/module/bank-cash/presentation/components/transaction-form/TransactionFormLayout';
import { TransactionSummaryCard } from '@/module/bank-cash/presentation/components/transaction-form/TransactionSummaryCard';

export const AddTransferMoneyPage = () => {
  const { t, currentLanguage } = useTranslation('bankCash');
  const navigate = useNavigate();

  const { cashAccounts, ready, isError } = useCashBankChoices();
  const from = usePrefilledAccount('fromAccountId', cashAccounts, ready);
  const [toId, setToId] = useState<string | null>(null);
  const [date, setDate] = useState(todayWib);
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const { mutate, isPending } = useBankCashTransactionMutation(t('transfer.success'));

  const options = useMemo(
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

  const source = cashAccounts.find((account) => account.id === from.value);
  const destination = cashAccounts.find((account) => account.id === toId);
  const missing = transferMissing({ date, fromId: from.value, toId, amount });

  const sourceAfter = source ? balanceAfter(source.amount || 0, amount) : null;
  const overdraft = amount > 0 && sourceAfter !== null && sourceAfter < 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (missing.length > 0 || !from.value || !toId) return;
    const payload = buildTransferPayload({
      transactionDate: date,
      fromAccountId: from.value,
      fromAccountName: source?.name,
      fromAccountNumber: source?.accountNumber,
      toAccountId: toId,
      toAccountName: destination?.name,
      toAccountNumber: destination?.accountNumber,
      amount,
      notes,
    });
    mutate({ ...payload, attachments: files });
  };

  return (
    <TransactionFormLayout
      icon={IconArrowsExchange}
      title={t('transfer.title')}
      description={t('transfer.description')}
      notices={
        <>
          {isError && <ChoicesLoadError />}
          {from.blocked && <PrefillBlockedNotice />}
        </>
      }
      onSubmit={handleSubmit}
      main={
        <>
          <FormSection
            icon={<IconBuildingBank size={18} />}
            title={t('transfer.detailsTitle')}
            hint={t('transfer.detailsHint')}
          >
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label={t('transfer.fromLabel')}
                  placeholder={t('transfer.fromPlaceholder')}
                  data={options}
                  value={from.value}
                  onChange={from.setValue}
                  searchable
                  nothingFoundMessage={t('common.noCashBankAccount')}
                  comboboxProps={{ shadow: 'md' }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label={t('transfer.toLabel')}
                  placeholder={t('transfer.toPlaceholder')}
                  data={options}
                  value={toId}
                  onChange={setToId}
                  searchable
                  nothingFoundMessage={t('common.noCashBankAccount')}
                  comboboxProps={{ shadow: 'md' }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <DateInput
                  label={t('transfer.dateLabel')}
                  valueFormat="DD/MM/YYYY"
                  value={date ? new Date(`${date}T00:00:00`) : null}
                  onChange={(value) => setDate(value ? dayjs(value).format('YYYY-MM-DD') : '')}
                  rightSection={<IconCalendar size={16} color="var(--mantine-color-dimmed)" />}
                />
              </Grid.Col>
            </Grid>
          </FormSection>

          <FormSection
            icon={<IconCoins size={18} />}
            title={t('transfer.amountTitle')}
            hint={t('transfer.amountHint')}
          >
            <NumberInput
              label={t('transfer.amountLabel')}
              placeholder="0"
              thousandSeparator="."
              decimalSeparator=","
              prefix="Rp "
              min={0}
              value={amount}
              onChange={(value) => setAmount(Number(value) || 0)}
            />
            <Textarea
              label={t('form.notes')}
              placeholder={t('transfer.notesPlaceholder')}
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
            {
              role: t('transfer.fromRole'),
              name: source?.name ?? null,
              balance: source?.amount ?? 0,
              after: sourceAfter,
            },
            {
              role: t('transfer.toRole'),
              name: destination?.name ?? null,
              balance: destination?.amount ?? 0,
              after: destination ? balanceAfterReceive(destination.amount || 0, amount) : null,
            },
          ]}
          total={{ label: t('transfer.total'), amount }}
          warning={overdraft ? t('form.overdraft') : null}
          missing={missing.map((reason) => t(`form.missing.${reason}`))}
          journal={transferPreview(
            source?.name ?? t('form.notSelected'),
            destination?.name ?? t('form.notSelected'),
            amount
          )}
          submitLabel={t('transfer.submit')}
          isPending={isPending}
          onCancel={() => navigate(routes.bankCash.main)}
        />
      }
    />
  );
};

export default AddTransferMoneyPage;
