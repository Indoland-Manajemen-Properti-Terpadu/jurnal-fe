import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FileInput,
  Grid,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import {
  IconAlertCircle,
  IconCalendar,
  IconFileInvoice,
  IconPaperclip,
  IconPlus,
} from '@tabler/icons-react';
import { formatCurrency } from '@/utils/FormatCurrency';
import { PettyCashFund, PettyCashVoucher } from '@/module/petty-cash/domain/pettyCashTypes';
import { MOCK_EXPENSE_ACCOUNTS } from '@/module/petty-cash/infrastructure/mockPettyCashFunds';

interface Props {
  opened: boolean;
  onClose: () => void;
  funds: PettyCashFund[];
  selectedFund?: PettyCashFund | null;
  onSubmit: (newVoucher: Omit<PettyCashVoucher, 'id' | 'createdAt'>) => void;
}

export const CreateVoucherModal: React.FC<Props> = ({
  opened,
  onClose,
  funds,
  selectedFund,
  onSubmit,
}) => {
  const [fundId, setFundId] = useState<string>(selectedFund?.id || funds[0]?.id || '');
  const [date, setDate] = useState<string | null>(dayjs().format('YYYY-MM-DD'));
  const [beneficiary, setBeneficiary] = useState('');
  const [expenseAccountId, setExpenseAccountId] = useState<string>(MOCK_EXPENSE_ACCOUNTS[0]?.id);
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    if (opened && selectedFund) setFundId(selectedFund.id);
  }, [opened, selectedFund]);

  // Derive active fund
  const activeFund = funds.find((f) => f.id === fundId) || selectedFund || funds[0];
  const maxAvailable = activeFund?.currentBalance || 0;
  const numAmount = typeof amount === 'number' ? amount : 0;
  const isOverLimit = numAmount > maxAvailable;
  const remainingAfter = maxAvailable - numAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !activeFund ||
      activeFund.status === 'FROZEN' ||
      numAmount <= 0 ||
      isOverLimit ||
      !beneficiary.trim() ||
      !description.trim()
    ) {
      return;
    }

    const selectedExpense =
      MOCK_EXPENSE_ACCOUNTS.find((a) => a.id === expenseAccountId) || MOCK_EXPENSE_ACCOUNTS[0];

    const now = new Date();
    const period = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const voucherNumber = `PCV/${period}/${String(now.getTime()).slice(-6)}`;

    onSubmit({
      fundId: activeFund.id,
      fundName: activeFund.name,
      voucherNumber,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      beneficiary: beneficiary.trim(),
      expenseAccount: selectedExpense,
      amount: numAmount,
      description: description.trim(),
      receiptNumber: receiptNumber.trim(),
      attachmentName: attachment?.name,
      status: 'PAID',
      createdBy: activeFund.custodianName,
    });

    // Reset Form
    setAmount('');
    setBeneficiary('');
    setDescription('');
    setReceiptNumber('');
    setAttachment(null);
    onClose();
  };

  const fundSelectData = funds.map((f) => ({
    value: f.id,
    label: `${f.name} (Sisa Fisik: ${formatCurrency(f.currentBalance)})`,
    disabled: f.status === 'FROZEN',
  }));

  const expenseSelectData = MOCK_EXPENSE_ACCOUNTS.map((a) => ({
    value: a.id,
    label: `${a.code} - ${a.name}`,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      radius="md"
      title={
        <Group gap="xs">
          <ThemeIcon size={32} radius="md" variant="light" color="primary">
            <IconFileInvoice size={18} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz={15} c="dark.9">
              Catat Voucher Pengeluaran Kas Kecil
            </Text>
            <Text fz={11} c="dimmed">
              Pencatatan bukti kwitansi / Bukti Pengeluaran Kas Kecil (BPKK)
            </Text>
          </div>
        </Group>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* Fund Selector */}
          <Select
            label="Akun Kas Kecil Sumber"
            description="Pilih pos kas kecil pemegang dana operasional"
            placeholder="Pilih dana kas kecil..."
            data={fundSelectData}
            value={fundId}
            onChange={(val) => val && setFundId(val)}
            required
          />

          <Grid gutter="sm">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DatePickerInput
                label="Tanggal Transaksi"
                placeholder="Pilih tanggal..."
                value={date}
                onChange={setDate}
                leftSection={<IconCalendar size={16} />}
                required
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Penerima Dana (Beneficiary)"
                placeholder="Contoh: Bambang (Driver), Toko Gramedia"
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.currentTarget.value)}
                required
              />
            </Grid.Col>
          </Grid>

          {/* Expense Account */}
          <Select
            label="Kategori / Pos Akun Beban (COA)"
            description="Klasifikasi pembukuan saat reimbursement nanti"
            placeholder="Pilih akun beban operasional..."
            data={expenseSelectData}
            value={expenseAccountId}
            onChange={(val) => val && setExpenseAccountId(val)}
            searchable
            required
          />

          {/* Amount & Realtime Balance Check */}
          <NumberInput
            label="Nominal Pengeluaran (Rp)"
            description={`Maksimum uang fisik tersedia di kasir: ${formatCurrency(maxAvailable)}`}
            placeholder="0"
            prefix="Rp "
            thousandSeparator="."
            decimalSeparator=","
            min={1}
            value={amount}
            onChange={(val) => setAmount(typeof val === 'number' ? val : '')}
            error={
              isOverLimit
                ? `Nominal melebihi sisa kas fisik (${formatCurrency(maxAvailable)})!`
                : undefined
            }
            required
          />

          {/* Poka-Yoke Warning if over limit */}
          {isOverLimit && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Peringatan Kas Tidak Cukup"
              color="red"
              variant="light"
              radius="md"
            >
              Saldo fisik uang tunai pada kas kecil ini tidak mencukupi untuk pembayaran{' '}
              <strong>{formatCurrency(numAmount)}</strong>. Harap ajukan{' '}
              <strong>Pengisian Kembali (Reimbursement)</strong> terlebih dahulu.
            </Alert>
          )}

          {/* Balance Preview Strip if valid */}
          {!isOverLimit && numAmount > 0 && (
            <Paper withBorder radius="md" p="xs" bg="primary.0">
              <Group justify="space-between">
                <Text fz={11} c="primary.9">
                  Simulasi Sisa Kas Fisik:{' '}
                  <Text span fw={700}>
                    {formatCurrency(maxAvailable)} - {formatCurrency(numAmount)} ={' '}
                    {formatCurrency(remainingAfter)}
                  </Text>
                </Text>
                <Text fz={11} fw={700} c="primary.8">
                  Kas Cukup ✓
                </Text>
              </Group>
            </Paper>
          )}

          <Textarea
            label="Deskripsi Keperluan Pengeluaran"
            placeholder="Tuliskan tujuan pengeluaran, nomor plat kendaraan, atau rincian barang..."
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            required
          />

          <Grid gutter="sm">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Nomor Struk / Nota Fisik"
                placeholder="Contoh: SPBU-8812, INV-0091"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <FileInput
                label="Lampiran Bukti / Kwitansi"
                placeholder="Unggah foto struk/nota..."
                leftSection={<IconPaperclip size={16} />}
                value={attachment}
                onChange={setAttachment}
                accept="image/*,application/pdf"
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="filled"
              color="primary"
              disabled={isOverLimit || numAmount <= 0 || !beneficiary.trim()}
              leftSection={<IconPlus size={16} />}
            >
              Simpan Voucher Pengeluaran
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default CreateVoucherModal;
