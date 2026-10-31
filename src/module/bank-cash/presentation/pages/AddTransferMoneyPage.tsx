import React, { useMemo, useState } from 'react';
import {
  Alert,
  Badge,
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
  IconArrowRight,
  IconArrowsExchange,
  IconBuildingBank,
  IconCalendar,
  IconCash,
  IconCheck,
  IconFileText,
  IconInfoCircle,
  IconWallet,
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
                <Box pos="sticky" top={20}>
                  <Stack gap="md">
                    {/* Live Preview Card */}
                    <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
                      <Stack gap="sm">
                        <Group justify="space-between" align="center">
                          <Text fw={700} size="sm" c="dark.8">
                            Simulasi Mutasi Saldo
                          </Text>
                          <Badge
                            size="sm"
                            variant="light"
                            color={isFormValid ? 'teal' : 'gray'}
                            leftSection={isFormValid ? <IconCheck size={12} /> : undefined}
                          >
                            {isFormValid ? 'Siap Dibukukan' : 'Belum Lengkap'}
                          </Badge>
                        </Group>

                        {/* Visual Flow from Account to Account */}
                        <Paper withBorder radius="sm" p="xs" bg="gray.0">
                          <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                            Akun Asal (Keluar / Kredit)
                          </Text>
                          <Text size="sm" fw={700} c="dark.8" mt={2} lineClamp={1}>
                            {selectedFromAccount?.name || '—'}
                          </Text>
                          <Group justify="space-between" mt={4}>
                            <Text size="xs" c="dimmed">
                              Saldo Saat Ini:
                            </Text>
                            <Text size="xs" fw={600} c="dark.7">
                              {formatCurrency(selectedFromAccount?.amount || 0)}
                            </Text>
                          </Group>
                          {amount > 0 && selectedFromAccount && (
                            <Group justify="space-between" mt={2}>
                              <Text size="xs" c="red.7" fw={600}>
                                Setelah Transfer:
                              </Text>
                              <Text size="xs" fw={700} c="red.7">
                                {formatCurrency((selectedFromAccount.amount || 0) - amount)}
                              </Text>
                            </Group>
                          )}
                        </Paper>

                        <Group justify="center" my={-4}>
                          <ThemeIcon size={26} radius="xl" variant="light" color="primary">
                            <IconArrowRight size={14} />
                          </ThemeIcon>
                        </Group>

                        <Paper withBorder radius="sm" p="xs" bg="gray.0">
                          <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                            Akun Tujuan (Masuk / Debit)
                          </Text>
                          <Text size="sm" fw={700} c="dark.8" mt={2} lineClamp={1}>
                            {selectedToAccount?.name || '—'}
                          </Text>
                          <Group justify="space-between" mt={4}>
                            <Text size="xs" c="dimmed">
                              Saldo Saat Ini:
                            </Text>
                            <Text size="xs" fw={600} c="dark.7">
                              {formatCurrency(selectedToAccount?.amount || 0)}
                            </Text>
                          </Group>
                          {amount > 0 && selectedToAccount && (
                            <Group justify="space-between" mt={2}>
                              <Text size="xs" c="teal.7" fw={600}>
                                Setelah Transfer:
                              </Text>
                              <Text size="xs" fw={700} c="teal.7">
                                {formatCurrency((selectedToAccount.amount || 0) + amount)}
                              </Text>
                            </Group>
                          )}
                        </Paper>

                        {/* Total Nominal Transfer Box */}
                        <Paper
                          withBorder
                          radius="sm"
                          p="sm"
                          style={{
                            background:
                              'linear-gradient(135deg, var(--mantine-color-primary-0) 0%, var(--mantine-color-secondary-0) 100%)',
                            borderColor: 'var(--mantine-color-primary-2)',
                          }}
                        >
                          <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                            Total Nominal Ditransfer
                          </Text>
                          <Text
                            size="lg"
                            fw={800}
                            c="primary.9"
                            mt={2}
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {formatCurrency(amount)}
                          </Text>
                        </Paper>
                      </Stack>
                    </Paper>

                    {/* Accounting Tips */}
                    <Paper withBorder radius="md" p="sm" bg="gray.0">
                      <Group gap="xs" align="flex-start" wrap="nowrap">
                        <ThemeIcon
                          size={22}
                          radius="xl"
                          variant="light"
                          color="blue"
                          style={{ flexShrink: 0, marginTop: 2 }}
                        >
                          <IconInfoCircle size={14} />
                        </ThemeIcon>
                        <Text size="xs" c="dimmed" lh={1.5}>
                          <b>Prinsip Akuntansi:</b> Pemindahan dana antar rekening mencatat Debit
                          pada kas penerima dan Kredit pada kas pengirim dengan nilai seimbang,
                          tanpa menimbulkan beban atau pendapatan.
                        </Text>
                      </Group>
                    </Paper>

                    {/* Actions */}
                    <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
                      <Stack gap="xs">
                        <Button
                          type="submit"
                          variant="gradient"
                          gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
                          size="md"
                          radius="md"
                          fullWidth
                          loading={isPending}
                          disabled={!isFormValid}
                          leftSection={<IconArrowsExchange size={18} />}
                        >
                          Proses Transfer Uang
                        </Button>

                        <Button
                          variant="default"
                          size="sm"
                          radius="md"
                          fullWidth
                          onClick={() => navigate(routes.BankAndCash.Main)}
                        >
                          Batal
                        </Button>
                      </Stack>
                    </Paper>
                  </Stack>
                </Box>
              </Grid.Col>
            </Grid>
          </form>
        </Stack>
      </Box>
    </AppShellLayout>
  );
};

export default AddTransferMoneyPage;
