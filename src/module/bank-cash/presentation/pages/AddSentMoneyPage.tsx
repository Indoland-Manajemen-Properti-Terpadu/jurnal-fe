import React, { useMemo, useState } from 'react';
import {
  ActionIcon,
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
  IconArrowLeft,
  IconArrowUpRight,
  IconBuildingBank,
  IconCalendar,
  IconCoins,
  IconFileText,
  IconPlus,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppShellLayout from '@/components/AppShellLayout';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/FormatCurrency';
import { useJournalAccounts } from '@/module/chart-of-accounts';
import { useBankCashTransactionMutation } from '@/module/bank-cash/presentation/hooks/useBankCashTransactionMutation';
import { useTranslation } from '@/i18n';
import { SentMoneySummaryPanel } from '@/module/bank-cash/presentation/components/transaction-form/SentMoneySummaryPanel';
import {
  balanceAfter,
  buildSentPayload,
  sumLineAmounts,
} from '@/module/bank-cash/domain/transactionPayload';

interface SentItemRow {
  id: string;
  accountId: string;
  description: string;
  amount: number;
}

export const AddSentMoneyPage = () => {
  const { t: tb, currentLanguage } = useTranslation('bankCash');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accounts } = useJournalAccounts();

  // Initial account prefill (if directed with query param)
  const initialFromId = searchParams.get('fromAccountId') || '';

  // Header State
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [payFromAccountId, setPayFromAccountId] = useState<string | null>(initialFromId || null);
  const [recipientName, setRecipientName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Dynamic Line Items (Akun Beban / Pengeluaran - Debit)
  const [items, setItems] = useState<SentItemRow[]>([
    {
      id: `item-${Date.now()}-1`,
      accountId: '',
      description: '',
      amount: 0,
    },
  ]);

  const { mutate: submitSent, isPending } = useBankCashTransactionMutation(tb('sent.success'));

  // Available Cash & Bank accounts (for payFrom)
  const bankAndCashAccounts = useMemo(
    () => (accounts || []).filter((acc) => acc.isBankAndCash),
    [accounts]
  );

  const bankAndCashOptions = useMemo(
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

  // All COA accounts (for debit expense items)
  const allAccountOptions = useMemo(
    () =>
      (accounts || []).map((acc) => ({
        value: acc.id,
        label: `${acc.accountNumber || ''} - ${acc.name} (${acc.category?.name || 'COA'})`,
      })),
    [accounts]
  );

  const selectedPayAccount = useMemo(
    () => bankAndCashAccounts.find((a) => a.id === payFromAccountId),
    [bankAndCashAccounts, payFromAccountId]
  );

  // Calculate Total
  const totalAmount = useMemo(() => sumLineAmounts(items), [items]);

  // Row Manipulation
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${prev.length + 1}`,
        accountId: '',
        description: '',
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof SentItemRow, value: string | number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  // Form Validation
  const hasValidAccount = Boolean(payFromAccountId);
  const hasValidItems =
    items.length > 0 && items.every((it) => it.accountId && Number(it.amount) > 0);
  const isFormValid = hasValidAccount && hasValidItems && totalAmount > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !payFromAccountId) return;

    submitSent(
      buildSentPayload({
        transactionDate,
        payFromAccountId,
        payFromAccountName: selectedPayAccount?.name,
        recipientName,
        notes,
        items,
      })
    );
  };

  const remainingBalance = balanceAfter(selectedPayAccount?.amount || 0, totalAmount);
  const isOverdraft = remainingBalance < 0;

  return (
    <AppShellLayout withFooter>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Header */}
          <ModuleHeader
            icon={IconArrowUpRight}
            title={tb('sent.title')}
            description={tb('sent.description')}
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
                  {/* Card 1: Informasi Rekening Sumber & Tanggal */}
                  <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                    <Stack gap="sm">
                      <Group gap="sm" mb={4}>
                        <ThemeIcon size={34} radius="md" variant="light" color="orange">
                          <IconBuildingBank size={18} />
                        </ThemeIcon>
                        <Box>
                          <Text fw={700} size="sm" c="dark.9">
                            {tb('sent.accountCardTitle')}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {tb('sent.accountCardHint')}
                          </Text>
                        </Box>
                      </Group>

                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <Select
                            label={tb('sent.payFrom')}
                            placeholder={tb('sent.payFromPlaceholder')}
                            data={bankAndCashOptions}
                            value={payFromAccountId}
                            onChange={setPayFromAccountId}
                            required
                            searchable
                            size="sm"
                            nothingFoundMessage={tb('common.noCashBankAccount')}
                            comboboxProps={{ shadow: 'md' }}
                          />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <DateInput
                            label={tb('sent.dateLabel')}
                            placeholder={tb('sent.datePlaceholder')}
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
                      </Grid>

                      <TextInput
                        label={tb('sent.recipientLabel')}
                        placeholder={tb('sent.recipientPlaceholder')}
                        leftSection={<IconUser size={15} color="var(--mantine-color-dimmed)" />}
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.currentTarget.value)}
                        size="sm"
                      />
                    </Stack>
                  </Paper>

                  {/* Card 2: Rincian Akun Beban / Pengeluaran (Debit) */}
                  <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                    <Stack gap="md">
                      <Group justify="space-between" align="center">
                        <Group gap="sm">
                          <ThemeIcon size={34} radius="md" variant="light" color="red">
                            <IconCoins size={18} />
                          </ThemeIcon>
                          <Box>
                            <Text fw={700} size="sm" c="dark.9">
                              {tb('sent.expensesTitle')}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {tb('sent.expensesHint')}
                            </Text>
                          </Box>
                        </Group>

                        <Button
                          variant="light"
                          color="red"
                          size="xs"
                          radius="md"
                          leftSection={<IconPlus size={14} />}
                          onClick={handleAddItem}
                        >
                          {tb('sent.addExpenseRow')}
                        </Button>
                      </Group>

                      {/* Line Items List */}
                      <Stack gap="xs">
                        {items.map((item, idx) => (
                          <Paper key={item.id} withBorder radius="md" p="sm" bg="gray.0">
                            <Grid columns={24} gutter="xs" align="flex-end">
                              <Grid.Col span={{ base: 24, md: 10 }}>
                                <Select
                                  label={tb('sent.expenseNumbered', { n: idx + 1 })}
                                  placeholder={tb('sent.expenseAccountPlaceholder')}
                                  data={allAccountOptions}
                                  value={item.accountId}
                                  onChange={(val) =>
                                    handleUpdateItem(item.id, 'accountId', val || '')
                                  }
                                  required
                                  searchable
                                  size="sm"
                                  nothingFoundMessage={tb('common.accountNotFound')}
                                  comboboxProps={{ shadow: 'md' }}
                                />
                              </Grid.Col>

                              <Grid.Col span={{ base: 24, md: 7 }}>
                                <TextInput
                                  label={tb('sent.expenseDescriptionLabel')}
                                  placeholder={tb('sent.expenseDescriptionPlaceholder')}
                                  size="sm"
                                  value={item.description}
                                  onChange={(e) =>
                                    handleUpdateItem(item.id, 'description', e.currentTarget.value)
                                  }
                                />
                              </Grid.Col>

                              <Grid.Col span={{ base: 19, md: 5 }}>
                                <NumberInput
                                  label={tb('sent.amountLabel')}
                                  placeholder="0"
                                  thousandSeparator="."
                                  decimalSeparator=","
                                  prefix="Rp "
                                  min={0}
                                  required
                                  size="sm"
                                  value={item.amount}
                                  onChange={(val) =>
                                    handleUpdateItem(item.id, 'amount', Number(val) || 0)
                                  }
                                />
                              </Grid.Col>

                              <Grid.Col span={{ base: 5, md: 2 }}>
                                <ActionIcon
                                  color="red"
                                  variant="subtle"
                                  size={36}
                                  radius="md"
                                  disabled={items.length <= 1}
                                  onClick={() => handleRemoveItem(item.id)}
                                  style={{ width: '100%', height: 36 }}
                                  aria-label={tb('common.removeRow')}
                                  title={tb('sent.removeRowTitle')}
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Grid.Col>
                            </Grid>
                          </Paper>
                        ))}
                      </Stack>
                    </Stack>
                  </Paper>

                  {/* Card 3: Memo & Bukti Pengeluaran */}
                  <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                    <Stack gap="sm">
                      <Group gap="sm" mb={4}>
                        <ThemeIcon size={34} radius="md" variant="light" color="indigo">
                          <IconFileText size={18} />
                        </ThemeIcon>
                        <Box>
                          <Text fw={700} size="sm" c="dark.9">
                            {tb('sent.notesTitle')}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {tb('sent.notesHint')}
                          </Text>
                        </Box>
                      </Group>

                      <Textarea
                        placeholder={tb('sent.notesPlaceholder')}
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.currentTarget.value)}
                      />
                    </Stack>
                  </Paper>
                </Stack>
              </Grid.Col>

              {/* Right Column (4 cols): Sticky Summary */}
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <SentMoneySummaryPanel
                  isFormValid={isFormValid}
                  selectedPayAccount={selectedPayAccount}
                  totalAmount={totalAmount}
                  isOverdraft={isOverdraft}
                  remainingBalance={remainingBalance}
                  itemCount={items.length}
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

export default AddSentMoneyPage;
