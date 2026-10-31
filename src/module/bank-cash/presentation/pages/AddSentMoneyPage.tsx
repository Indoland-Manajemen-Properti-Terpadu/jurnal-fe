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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('journal');
  const { accounts, isLoading: isLoadingAccounts } = useJournalAccounts();

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

  const { mutate: submitSent, isPending } = useBankCashTransactionMutation(
    'Pengeluaran kas berhasil dibukukan ke dalam jurnal umum.'
  );

  // Available Cash & Bank accounts (for payFrom)
  const bankAndCashAccounts = useMemo(() => {
    return (accounts || []).filter((acc) => acc.isBankAndCash);
  }, [accounts]);

  const bankAndCashOptions = useMemo(() => {
    return bankAndCashAccounts.map((acc) => ({
      value: acc.id,
      label: `${acc.name} (${acc.accountNumber || '—'}) • Saldo: ${formatCurrency(acc.amount || 0)}`,
    }));
  }, [bankAndCashAccounts]);

  // All COA accounts (for debit expense items)
  const allAccountOptions = useMemo(() => {
    return (accounts || []).map((acc) => ({
      value: acc.id,
      label: `${acc.accountNumber || ''} - ${acc.name} (${acc.category?.name || 'COA'})`,
    }));
  }, [accounts]);

  const selectedPayAccount = useMemo(() => {
    return bankAndCashAccounts.find((a) => a.id === payFromAccountId);
  }, [bankAndCashAccounts, payFromAccountId]);

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

  const handleUpdateItem = (id: string, field: keyof SentItemRow, value: any) => {
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
            title="Kirim Uang (Pengeluaran Kas Keluar)"
            description="Catat pengeluaran kas langsung atau pembayaran beban operasional non-faktur, seperti biaya listrik, perlengkapan ATK, konsumsi rapat, bensin, atau penarikan prive pemilik."
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
                  {/* Card 1: Informasi Rekening Sumber & Tanggal */}
                  <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                    <Stack gap="sm">
                      <Group gap="sm" mb={4}>
                        <ThemeIcon size={34} radius="md" variant="light" color="orange">
                          <IconBuildingBank size={18} />
                        </ThemeIcon>
                        <Box>
                          <Text fw={700} size="sm" c="dark.9">
                            Rekening Kas/Bank Pembayar & Tanggal
                          </Text>
                          <Text size="xs" c="dimmed">
                            Pilih rekening sumber yang digunakan untuk membayarkan pengeluaran
                          </Text>
                        </Box>
                      </Group>

                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <Select
                            label="Bayar Dari (Akun Kas / Bank - Kredit)"
                            placeholder="Pilih rekening sumber..."
                            data={bankAndCashOptions}
                            value={payFromAccountId}
                            onChange={setPayFromAccountId}
                            required
                            searchable
                            size="sm"
                            nothingFoundMessage="Tidak ada rekening kas/bank"
                            comboboxProps={{ shadow: 'md' }}
                          />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <DateInput
                            label="Tanggal Pembayaran"
                            placeholder="Pilih tanggal pembayaran"
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
                        label="Dibayar Kepada / Nama Penerima (Opsional)"
                        placeholder="misal: PLN, SPBU Pertamina, Toko ATK, Vendor Jasa..."
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
                              Alokasi Akun Beban / Biaya (Debit)
                            </Text>
                            <Text size="xs" c="dimmed">
                              Tentukan pos akun beban pengeluaran (Beban Operasional, Beban Listrik,
                              dll.)
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
                          Tambah Baris Biaya
                        </Button>
                      </Group>

                      {/* Line Items List */}
                      <Stack gap="xs">
                        {items.map((item, idx) => (
                          <Paper key={item.id} withBorder radius="md" p="sm" bg="gray.0">
                            <Grid columns={24} gutter="xs" align="flex-end">
                              <Grid.Col span={{ base: 24, md: 10 }}>
                                <Select
                                  label={`Akun Beban #${idx + 1}`}
                                  placeholder="Pilih akun beban COA..."
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
                                  label="Deskripsi / Keperluan Biaya"
                                  placeholder="Keterangan pengeluaran..."
                                  size="sm"
                                  value={item.description}
                                  onChange={(e) =>
                                    handleUpdateItem(item.id, 'description', e.currentTarget.value)
                                  }
                                />
                              </Grid.Col>

                              <Grid.Col span={{ base: 19, md: 5 }}>
                                <NumberInput
                                  label="Nominal Biaya (Rp)"
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
                                  title="Hapus baris pengeluaran"
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
                            Catatan Pengeluaran & Nomor Bukti
                          </Text>
                          <Text size="xs" c="dimmed">
                            Sertakan nomor kuitansi, struk nota, atau catatan verifikasi pembayaran
                          </Text>
                        </Box>
                      </Group>

                      <Textarea
                        placeholder="misal: Pembelian perlengkapan kantor bulanan, nota terlampir di kasir..."
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
