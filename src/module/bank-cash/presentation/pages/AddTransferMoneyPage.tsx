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
import { formatCurrency } from '@/utils/FormatCurrency';
import { useJournalAccounts } from '@/module/chart-of-accounts';
import { useBankCashTransactionMutation } from '@/module/bank-cash/presentation/hooks/useBankCashTransactionMutation';
import { useTranslation } from '@/i18n';
import { TransferMoneySummaryPanel } from '@/module/bank-cash/presentation/components/transaction-form/TransferMoneySummaryPanel';
import { buildTransferPayload } from '@/module/bank-cash/domain/transactionPayload';

export const AddTransferMoneyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('journal');
  const { accounts, isLoading: isLoadingAccounts } = useJournalAccounts();

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
    'Dana berhasil dipindahkan antar rekening kas dan bank.'
  );

  // Available Cash & Bank accounts
  const bankAndCashAccounts = useMemo(() => {
    return (accounts || []).filter((acc) => acc.isBankAndCash);
  }, [accounts]);

  const accountSelectOptions = useMemo(() => {
    return bankAndCashAccounts.map((acc) => ({
      value: acc.id,
      label: `${acc.name} (${acc.accountNumber || '—'}) • Saldo: ${formatCurrency(acc.amount || 0)}`,
    }));
  }, [bankAndCashAccounts]);

  const selectedFromAccount = useMemo(() => {
    return bankAndCashAccounts.find((a) => a.id === accountFromId);
  }, [bankAndCashAccounts, accountFromId]);

  const selectedToAccount = useMemo(() => {
    return bankAndCashAccounts.find((a) => a.id === accountToId);
  }, [bankAndCashAccounts, accountToId]);

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
            title="Transfer Uang Antar Kas & Bank"
            description="Pindahkan saldo antar rekening perbankan atau kas operasional perusahaan. Transaksi ini tercatat otomatis di Buku Besar tanpa mempengaruhi laporan laba rugi."
            actions={
              <Button
                variant="default"
                radius="md"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(routes.BankAndCash.Main)}
              >
                Kembali ke Kas & Bank
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
                            Tanggal & Bukti Transaksi
                          </Text>
                          <Text size="xs" c="dimmed">
                            Tentukan tanggal efektif pembukuan mutasi pemindahan dana
                          </Text>
                        </Box>
                      </Group>

                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <DateInput
                            label="Tanggal Transfer"
                            placeholder="Pilih tanggal transfer"
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
                            label="Nomor Referensi / Ref ID (Opsional)"
                            placeholder="misal: TRF-2026-001"
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
                            Akun Kas & Bank Asal dan Tujuan
                          </Text>
                          <Text size="xs" c="dimmed">
                            Pilih rekening sumber yang berkurang dan rekening penampung yang
                            bertambah
                          </Text>
                        </Box>
                      </Group>

                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <Select
                            label="Transfer Dari (Akun Asal - Kredit)"
                            description="Saldo akun ini akan berkurang"
                            placeholder="Pilih rekening asal..."
                            data={accountSelectOptions}
                            value={accountFromId}
                            onChange={setAccountFromId}
                            required
                            searchable
                            size="sm"
                            nothingFoundMessage="Tidak ada akun kas/bank"
                            comboboxProps={{ shadow: 'md' }}
                          />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <Select
                            label="Setor Ke (Akun Tujuan - Debit)"
                            description="Saldo akun ini akan bertambah"
                            placeholder="Pilih rekening tujuan..."
                            data={accountSelectOptions}
                            value={accountToId}
                            onChange={setAccountToId}
                            required
                            searchable
                            size="sm"
                            nothingFoundMessage="Tidak ada akun kas/bank"
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
                          Akun asal dan akun tujuan tidak boleh sama. Silakan pilih dua rekening
                          yang berbeda.
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
                            Nominal Pemindahan & Catatan
                          </Text>
                          <Text size="xs" c="dimmed">
                            Tentukan besaran nominal dana yang dipindahkan
                          </Text>
                        </Box>
                      </Group>

                      <NumberInput
                        label="Nominal Transfer"
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
                            fontSize: 16,
                            color: 'var(--mantine-color-primary-9)',
                          },
                        }}
                      />

                      <Textarea
                        label="Keterangan / Memo Pembukuan"
                        placeholder="misal: Setor tunai hasil penjualan harian ke rekening operasional BCA..."
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
