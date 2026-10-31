import React, { useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconArrowDownRight,
  IconArrowLeft,
  IconBuildingBank,
  IconCalendar,
  IconCheck,
  IconCoins,
  IconFileText,
  IconInfoCircle,
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
import { buildReceivePayload, sumLineAmounts } from '@/module/bank-cash/domain/transactionPayload';

interface ReceiveItemRow {
  id: string;
  accountId: string;
  description: string;
  amount: number;
}

export const AddReceiveMoneyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('journal');
  const { accounts, isLoading: isLoadingAccounts } = useJournalAccounts();

  // Initial account prefill (if directed with query param)
  const initialToId = searchParams.get('toAccountId') || '';

  // Header State
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [depositToAccountId, setDepositToAccountId] = useState<string | null>(initialToId || null);
  const [payerName, setPayerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Dynamic Line Items (Akun Sumber / Kredit)
  const [items, setItems] = useState<ReceiveItemRow[]>([
    {
      id: `item-${Date.now()}-1`,
      accountId: '',
      description: '',
      amount: 0,
    },
  ]);

  const { mutate: submitReceive, isPending } = useBankCashTransactionMutation(
    'Penerimaan uang berhasil dicatat dan dibukukan ke dalam kas & bank.'
  );

  // Available Cash & Bank accounts (for depositTo)
  const bankAndCashAccounts = useMemo(() => {
    return (accounts || []).filter((acc) => acc.isBankAndCash);
  }, [accounts]);

  const bankAndCashOptions = useMemo(() => {
    return bankAndCashAccounts.map((acc) => ({
      value: acc.id,
      label: `${acc.name} (${acc.accountNumber || '—'}) • Saldo: ${formatCurrency(acc.amount || 0)}`,
    }));
  }, [bankAndCashAccounts]);

  // All COA accounts (for credit source items)
  const allAccountOptions = useMemo(() => {
    return (accounts || []).map((acc) => ({
      value: acc.id,
      label: `${acc.accountNumber || ''} - ${acc.name} (${acc.category?.name || 'COA'})`,
    }));
  }, [accounts]);

  const selectedDepositAccount = useMemo(() => {
    return bankAndCashAccounts.find((a) => a.id === depositToAccountId);
  }, [bankAndCashAccounts, depositToAccountId]);

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

  const handleUpdateItem = (id: string, field: keyof ReceiveItemRow, value: any) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  // Form Validation
  const hasValidAccount = Boolean(depositToAccountId);
  const hasValidItems =
    items.length > 0 && items.every((it) => it.accountId && Number(it.amount) > 0);
  const isFormValid = hasValidAccount && hasValidItems && totalAmount > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !depositToAccountId) return;

    submitReceive(
      buildReceivePayload({
        transactionDate,
        depositToAccountId,
        depositAccountName: selectedDepositAccount?.name,
        payerName,
        notes,
        items,
      })
    );
  };

  return (
    <AppShellLayout withFooter>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Header */}
          <ModuleHeader
            icon={IconArrowDownRight}
            title="Terima Uang (Penerimaan Kas Masuk)"
            description="Catat penerimaan kas langsung atau setoran bank non-penjualan, seperti pendapatan bunga, setoran modal pemilik, pencairan pinjaman, atau pengembalian dana."
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
                  {/* Card 1: Informasi Rekening Penampung & Tanggal */}
                  <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                    <Stack gap="sm">
                      <Group gap="sm" mb={4}>
                        <ThemeIcon size={34} radius="md" variant="light" color="teal">
                          <IconBuildingBank size={18} />
                        </ThemeIcon>
                        <Box>
                          <Text fw={700} size="sm" c="dark.9">
                            Rekening Kas/Bank Penampung & Tanggal
                          </Text>
                          <Text size="xs" c="dimmed">
                            Pilih rekening tujuan tempat uang disetorkan atau diterima
                          </Text>
                        </Box>
                      </Group>

                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <Select
                            label="Setor Ke (Akun Kas / Bank - Debit)"
                            placeholder="Pilih rekening penerima..."
                            data={bankAndCashOptions}
                            value={depositToAccountId}
                            onChange={setDepositToAccountId}
                            required
                            searchable
                            size="sm"
                            nothingFoundMessage="Tidak ada rekening kas/bank"
                            comboboxProps={{ shadow: 'md' }}
                          />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <DateInput
                            label="Tanggal Penerimaan"
                            placeholder="Pilih tanggal penerimaan"
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
                        label="Diterima Dari / Nama Pembayar (Opsional)"
                        placeholder="misal: PT Maju Bersama, Pemilik Usaha, Bank BCA (Bunga)..."
                        leftSection={<IconUser size={15} color="var(--mantine-color-dimmed)" />}
                        value={payerName}
                        onChange={(e) => setPayerName(e.currentTarget.value)}
                        size="sm"
                      />
                    </Stack>
                  </Paper>

                  {/* Card 2: Rincian Akun Sumber Penerimaan (Kredit) */}
                  <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                    <Stack gap="md">
                      <Group justify="space-between" align="center">
                        <Group gap="sm">
                          <ThemeIcon size={34} radius="md" variant="light" color="primary">
                            <IconCoins size={18} />
                          </ThemeIcon>
                          <Box>
                            <Text fw={700} size="sm" c="dark.9">
                              Alokasi Akun Sumber Penerimaan (Kredit)
                            </Text>
                            <Text size="xs" c="dimmed">
                              Tentukan akun sumber penerimaan (Pendapatan Lain-lain, Modal, Hutang,
                              dll.)
                            </Text>
                          </Box>
                        </Group>

                        <Button
                          variant="light"
                          size="xs"
                          radius="md"
                          leftSection={<IconPlus size={14} />}
                          onClick={handleAddItem}
                        >
                          Tambah Baris
                        </Button>
                      </Group>

                      {/* Line Items List */}
                      <Stack gap="xs">
                        {items.map((item, idx) => (
                          <Paper key={item.id} withBorder radius="md" p="sm" bg="gray.0">
                            <Grid columns={24} gutter="xs" align="flex-end">
                              <Grid.Col span={{ base: 24, md: 10 }}>
                                <Select
                                  label={`Akun Sumber #${idx + 1}`}
                                  placeholder="Pilih akun COA..."
                                  data={allAccountOptions}
                                  value={item.accountId}
                                  onChange={(val) =>
                                    handleUpdateItem(item.id, 'accountId', val || '')
                                  }
                                  required
                                  searchable
                                  size="sm"
                                  nothingFoundMessage="Akun tidak ditemukan"
                                  comboboxProps={{ shadow: 'md' }}
                                />
                              </Grid.Col>

                              <Grid.Col span={{ base: 24, md: 7 }}>
                                <TextInput
                                  label="Deskripsi / Keterangan Baris"
                                  placeholder="Keterangan alokasi..."
                                  size="sm"
                                  value={item.description}
                                  onChange={(e) =>
                                    handleUpdateItem(item.id, 'description', e.currentTarget.value)
                                  }
                                />
                              </Grid.Col>

                              <Grid.Col span={{ base: 19, md: 5 }}>
                                <NumberInput
                                  label="Nominal (Rp)"
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
                                  aria-label="Hapus baris"
                                  title="Hapus baris penerimaan"
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

                  {/* Card 3: Memo Transaksi */}
                  <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                    <Stack gap="sm">
                      <Group gap="sm" mb={4}>
                        <ThemeIcon size={34} radius="md" variant="light" color="indigo">
                          <IconFileText size={18} />
                        </ThemeIcon>
                        <Box>
                          <Text fw={700} size="sm" c="dark.9">
                            Catatan Tambahan & Referensi
                          </Text>
                          <Text size="xs" c="dimmed">
                            Tambahkan catatan internal atau nomor bukti setor untuk memudahkan
                            rekonsiliasi
                          </Text>
                        </Box>
                      </Group>

                      <Textarea
                        placeholder="misal: Setoran modal tambahan awal bulan, bukti transfer terlampir..."
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
                <Box pos="sticky" top={20}>
                  <Stack gap="md">
                    {/* Live Summary Card */}
                    <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
                      <Stack gap="sm">
                        <Group justify="space-between" align="center">
                          <Text fw={700} size="sm" c="dark.8">
                            Ringkasan Penerimaan
                          </Text>
                          <Badge
                            size="sm"
                            variant="light"
                            color={isFormValid ? 'teal' : 'gray'}
                            leftSection={isFormValid ? <IconCheck size={12} /> : undefined}
                          >
                            {isFormValid ? 'Seimbang (Balance)' : 'Belum Lengkap'}
                          </Badge>
                        </Group>

                        {/* Rekening Tujuan Box */}
                        <Paper withBorder radius="sm" p="xs" bg="gray.0">
                          <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                            Rekening Penampung (Debit)
                          </Text>
                          <Text size="sm" fw={700} c="dark.8" mt={2} lineClamp={1}>
                            {selectedDepositAccount?.name || 'Belum dipilih'}
                          </Text>
                          <Group justify="space-between" mt={4}>
                            <Text size="xs" c="dimmed">
                              Saldo Saat Ini:
                            </Text>
                            <Text size="xs" fw={600} c="dark.7">
                              {formatCurrency(selectedDepositAccount?.amount || 0)}
                            </Text>
                          </Group>
                          {totalAmount > 0 && selectedDepositAccount && (
                            <Group justify="space-between" mt={2}>
                              <Text size="xs" c="teal.7" fw={600}>
                                Estimasi Setelah Diterima:
                              </Text>
                              <Text size="xs" fw={700} c="teal.7">
                                {formatCurrency((selectedDepositAccount.amount || 0) + totalAmount)}
                              </Text>
                            </Group>
                          )}
                        </Paper>

                        {/* Total Kas Masuk Box */}
                        <Paper
                          withBorder
                          radius="sm"
                          p="sm"
                          style={{
                            background:
                              'linear-gradient(135deg, var(--mantine-color-teal-0) 0%, var(--mantine-color-green-0) 100%)',
                            borderColor: 'var(--mantine-color-teal-3)',
                          }}
                        >
                          <Text size="xs" c="teal.9" fw={600} tt="uppercase">
                            Total Kas Masuk (Debit Kas & Bank)
                          </Text>
                          <Text
                            size="xl"
                            fw={800}
                            c="teal.9"
                            mt={2}
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {formatCurrency(totalAmount)}
                          </Text>
                          <Text size="xs" c="dimmed" mt={4}>
                            Dialokasikan ke {items.length} akun sumber
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
                          <b>Prinsip Double-Entry:</b> Penerimaan uang mendebit akun Kas/Bank
                          penampung dan mengkredit akun sumber penerimaan
                          (pendapatan/modal/kewajiban) dalam jumlah yang tepat seimbang.
                        </Text>
                      </Group>
                    </Paper>

                    {/* Actions */}
                    <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
                      <Stack gap="xs">
                        <Button
                          type="submit"
                          variant="gradient"
                          gradient={{ from: 'teal.6', to: 'green.6', deg: 135 }}
                          size="md"
                          radius="md"
                          fullWidth
                          loading={isPending}
                          disabled={!isFormValid}
                          leftSection={<IconArrowDownRight size={18} />}
                        >
                          Simpan Penerimaan Uang
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

export default AddReceiveMoneyPage;
