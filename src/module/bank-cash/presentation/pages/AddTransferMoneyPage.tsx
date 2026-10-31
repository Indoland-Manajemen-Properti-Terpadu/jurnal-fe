import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconArrowsExchange,
  IconBuildingBank,
  IconCalendar,
  IconCash,
} from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppShellLayout from '@/components/AppShellLayout';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { useJournalAccounts } from '@/module/chart-of-accounts';
import { useBankCashTransactionMutation } from '@/module/bank-cash/presentation/hooks/useBankCashTransactionMutation';
import { useTranslation } from '@/i18n';
import { TransferMoneySummaryPanel } from '@/module/bank-cash/presentation/components/transaction-form/TransferMoneySummaryPanel';
import { buildTransferPayload } from '@/module/bank-cash/domain/transactionPayload';

export const AddTransferMoneyPage = () => {
  const { t: tb, currentLanguage } = useTranslation('bankCash');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accounts } = useJournalAccounts();

  // Query param prefill (if redirected from row action)
  const initialFromId = searchParams.get('fromAccountId') || '';

  // Form State
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [accountFromId, setAccountFromId] = useState<string | null>(initialFromId || null);
  const [accountToId, setAccountToId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const { mutate: submitTransfer, isPending } = useBankCashTransactionMutation(
    tb('transfer.success')
  );

  // Available Cash & Bank accounts
  const bankAndCashAccounts = useMemo(
    () => (accounts || []).filter((acc) => acc.isBankAndCash),
    [accounts]
  );

  const accountSelectOptions = useMemo(
    () =>
      bankAndCashAccounts.map((acc) => ({
        value: acc.id,
        label: tb('common.accountOption', {
          name: acc.name,
          number: acc.accountNumber || '—',
          balance: formatCurrency(acc.amount || 0),
        }),
      })),
    [bankAndCashAccounts, currentLanguage]
  );

  const selectedFromAccount = useMemo(
    () => bankAndCashAccounts.find((a) => a.id === accountFromId),
    [bankAndCashAccounts, accountFromId]
  );

  const selectedToAccount = useMemo(
    () => bankAndCashAccounts.find((a) => a.id === accountToId),
    [bankAndCashAccounts, accountToId]
  );

  // Validation
  const isSameAccount = Boolean(accountFromId && accountToId && accountFromId === accountToId);
  const isAmountValid = amount > 0;
  const isFormValid = Boolean(
    accountFromId && accountToId && !isSameAccount && isAmountValid && transactionDate
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !accountFromId || !accountToId) return;

    submitTransfer(
      buildTransferPayload({
        transactionDate,
        fromAccountId: accountFromId,
        fromAccountName: selectedFromAccount?.name,
        fromAccountNumber: selectedFromAccount?.accountNumber,
        toAccountId: accountToId,
        toAccountName: selectedToAccount?.name,
        toAccountNumber: selectedToAccount?.accountNumber,
        amount,
        notes,
      })
    );
  };

  return (
    <AppShellLayout withFooter>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Header */}
          <ModuleHeader
            icon={IconArrowsExchange}
            title={tb('transfer.title')}
            description={tb('transfer.description')}
            actions={
              <Button
                variant="default"
                radius="md"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(routes.BankAndCash.Main)}
              >
                {tb('common.backToCashBank')}
              </Button>
            }
          />

          <form onSubmit={handleSubmit}>
            <Grid gutter="lg" align="flex-start">
              {/* Left Column (8 cols): Input Fields */}
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <Stack gap="md">
                  {/* Card 1: Tanggal & Referensi Transaksi */}
                  <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                    <Stack gap="sm">
                      <Group gap="sm" mb={4}>
                        <ThemeIcon size={34} radius="md" variant="light" color="primary">
                          <IconCalendar size={18} />
                        </ThemeIcon>
                        <Box>
                          <Text fw={700} size="sm" c="dark.9">
                            {tb('transfer.dateCardTitle')}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {tb('transfer.dateCardHint')}
                          </Text>
                        </Box>
                      </Group>

                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <DateInput
                            label={tb('transfer.dateLabel')}
                            placeholder={tb('transfer.datePlaceholder')}
                            valueFormat="DD/MM/YYYY"
                            required
                            size="sm"
                            value={transactionDate ? new Date(transactionDate) : null}
                            onChange={(val) =>
                              setTransactionDate(val ? dayjs(val).format('YYYY-MM-DD') : '')
                            }
                            rightSection={
                              <IconCalendar size={16} color="var(--mantine-color-dimmed)" />
                            }
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <TextInput
                            label={tb('transfer.referenceLabel')}
                            placeholder={tb('transfer.referencePlaceholder')}
                            size="sm"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.currentTarget.value)}
                          />
                        </Grid.Col>
                      </Grid>
                    </Stack>
                  </Paper>

                  {/* Card 2: Pemilihan Rekening Kas/Bank */}
                  <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                    <Stack gap="sm">
                      <Group gap="sm" mb={4}>
                        <ThemeIcon size={34} radius="md" variant="light" color="blue">
                          <IconBuildingBank size={18} />
                        </ThemeIcon>
                        <Box>
                          <Text fw={700} size="sm" c="dark.9">
                            {tb('transfer.accountsCardTitle')}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {tb('transfer.accountsCardHint')}
                          </Text>
                        </Box>
                      </Group>

                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <Select
                            label={tb('transfer.fromLabel')}
                            description={tb('transfer.fromDescription')}
                            placeholder={tb('transfer.fromPlaceholder')}
                            data={accountSelectOptions}
                            value={accountFromId}
                            onChange={setAccountFromId}
                            required
                            searchable
                            size="sm"
                            nothingFoundMessage={tb('transfer.noAccount')}
                            comboboxProps={{ shadow: 'md' }}
                          />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <Select
                            label={tb('transfer.toLabel')}
                            description={tb('transfer.toDescription')}
                            placeholder={tb('transfer.toPlaceholder')}
                            data={accountSelectOptions}
                            value={accountToId}
                            onChange={setAccountToId}
                            required
                            searchable
                            size="sm"
                            nothingFoundMessage={tb('transfer.noAccount')}
                            comboboxProps={{ shadow: 'md' }}
                          />
                        </Grid.Col>
                      </Grid>

                      {isSameAccount && (
                        <Alert
                          icon={<IconAlertCircle size={16} />}
                          color="red"
                          variant="light"
                          radius="md"
                        >
                          {tb('transfer.sameAccount')}
                        </Alert>
                      )}
                    </Stack>
                  </Paper>

                  {/* Card 3: Nominal & Keterangan Memo */}
                  <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                    <Stack gap="sm">
                      <Group gap="sm" mb={4}>
                        <ThemeIcon size={34} radius="md" variant="light" color="teal">
                          <IconCash size={18} />
                        </ThemeIcon>
                        <Box>
                          <Text fw={700} size="sm" c="dark.9">
                            {tb('transfer.amountCardTitle')}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {tb('transfer.amountCardHint')}
                          </Text>
                        </Box>
                      </Group>

                      <NumberInput
                        label={tb('transfer.amountLabel')}
                        placeholder="0"
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="Rp "
                        min={0}
                        required
                        size="sm"
                        value={amount}
                        onChange={(val) => setAmount(Number(val) || 0)}
                        styles={{
                          input: {
                            fontWeight: 700,
                            fontSize: 'var(--jurnal-text-md)',
                            color: 'var(--mantine-color-primary-9)',
                          },
                        }}
                      />

                      <Textarea
                        label={tb('transfer.memoLabel')}
                        placeholder={tb('transfer.memoPlaceholder')}
                        rows={3}
                        size="sm"
                        value={notes}
                        onChange={(e) => setNotes(e.currentTarget.value)}
                      />
                    </Stack>
                  </Paper>
                </Stack>
              </Grid.Col>

              {/* Right Column (4 cols): Sticky Preview & Summary */}
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <TransferMoneySummaryPanel
                  isFormValid={isFormValid}
                  selectedFromAccount={selectedFromAccount}
                  selectedToAccount={selectedToAccount}
                  amount={amount}
                  isPending={isPending}
                />
              </Grid.Col>
            </Grid>
          </form>
        </Stack>
      </Box>
    </AppShellLayout>
  );
};

export default AddTransferMoneyPage;
