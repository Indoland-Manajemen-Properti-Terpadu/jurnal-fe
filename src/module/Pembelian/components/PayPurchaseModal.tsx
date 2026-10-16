import React, { useState } from 'react';
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { IconCheck, IconCoins } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/FormatCurrency';
import { PayPurchasePayload, PurchaseBill } from '../types/purchase';

interface PayPurchaseModalProps {
  opened: boolean;
  onClose: () => void;
  bill: PurchaseBill | null;
  onSubmit: (payload: PayPurchasePayload) => boolean;
}

export const PayPurchaseModal: React.FC<PayPurchaseModalProps> = ({
  opened,
  onClose,
  bill,
  onSubmit,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');
  const [paymentAccount, setPaymentAccount] = useState('1-10001');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (bill) {
      setAmount(bill.remainingAmount);
    }
  }, [bill]);

  if (!bill) return null;

  const handleSubmit = () => {
    if (!paymentDate || amount <= 0) return;

    const success = onSubmit({
      purchaseId: bill.id,
      paymentDate,
      amount: Math.min(amount, bill.remainingAmount),
      paymentMethod,
      paymentAccountId: paymentAccount,
      notes,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm" align="center">
          <ThemeIcon size={38} radius="md" color="teal" variant="light">
            <IconCoins size={20} />
          </ThemeIcon>
          <Text fw={700} size="md" c="dark.9">
            Catat Pembayaran Tagihan Pembelian
          </Text>
        </Group>
      }
      size="md"
      radius="lg"
      centered
      padding="lg"
    >
      <Stack gap="md">
        <Paper withBorder radius="md" p="sm" bg="gray.0">
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Nomor Tagihan:
            </Text>
            <Text size="xs" fw={700} ff="monospace">
              {bill.billNumber}
            </Text>
          </Group>
          <Group justify="space-between" mt={4}>
            <Text size="xs" c="dimmed">
              Vendor:
            </Text>
            <Text size="xs" fw={600}>
              {bill.vendorName}
            </Text>
          </Group>
          <Group justify="space-between" mt={4}>
            <Text size="xs" c="dimmed">
              Sisa Hutang:
            </Text>
            <Text size="sm" fw={800} c="red.7">
              {formatCurrency(bill.remainingAmount)}
            </Text>
          </Group>
        </Paper>

        <NumberInput
          label="Jumlah Pembayaran (Rp)"
          value={amount}
          onChange={(v) => setAmount(Number(v) || 0)}
          max={bill.remainingAmount}
          thousandSeparator="."
          decimalSeparator=","
          required
        />

        <DateInput
          label="Tanggal Pembayaran"
          value={paymentDate ? new Date(paymentDate) : null}
          onChange={(val) => setPaymentDate(val ? dayjs(val).format('YYYY-MM-DD') : '')}
          valueFormat="DD/MM/YYYY"
          required
        />

        <Select
          label="Metode Pembayaran"
          value={paymentMethod}
          onChange={(v) => setPaymentMethod(v || 'Transfer Bank')}
          data={['Transfer Bank', 'Kas Tunai', 'Giro / Cek']}
        />

        <Select
          label="Bayar Dari Rekening Kas & Bank"
          value={paymentAccount}
          onChange={(v) => setPaymentAccount(v || '1-10001')}
          data={[
            { value: '1-10001', label: '1-10001 · Kas Operasional Kantor' },
            { value: '1-10002', label: '1-10002 · Bank BCA Bisnis Utama' },
            { value: '1-10003', label: '1-10003 · Bank Mandiri Rekening Giro' },
          ]}
        />

        <Textarea
          label="Catatan Pembayaran"
          placeholder="Nomor referensi bukti transfer bank / keterangan"
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          rows={2}
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Batal
          </Button>
          <Button color="teal" leftSection={<IconCheck size={16} />} onClick={handleSubmit}>
            Konfirmasi Pembayaran
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
