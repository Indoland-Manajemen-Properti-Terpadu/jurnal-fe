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
import { formatCurrency } from '@/utils/formatCurrency';
import { PayPurchasePayload, PurchaseBill } from '@/module/purchases/domain/purchase';
import { useTranslation } from '@/i18n';

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
  const { t } = useTranslation('purchases');
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
            {t('pay.title')}
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
              {t('pay.billNumber')}
            </Text>
            <Text size="xs" fw={700} ff="monospace">
              {bill.billNumber}
            </Text>
          </Group>
          <Group justify="space-between" mt={4}>
            <Text size="xs" c="dimmed">
              {t('pay.vendor')}
            </Text>
            <Text size="xs" fw={600}>
              {bill.vendorName}
            </Text>
          </Group>
          <Group justify="space-between" mt={4}>
            <Text size="xs" c="dimmed">
              {t('pay.remaining')}
            </Text>
            <Text size="sm" fw={800} c="red.7">
              {formatCurrency(bill.remainingAmount)}
            </Text>
          </Group>
        </Paper>

        <NumberInput
          label={t('pay.amount')}
          value={amount}
          onChange={(v) => setAmount(Number(v) || 0)}
          max={bill.remainingAmount}
          thousandSeparator="."
          decimalSeparator=","
          required
        />

        <DateInput
          label={t('pay.date')}
          value={paymentDate ? new Date(paymentDate) : null}
          onChange={(val) => setPaymentDate(val ? dayjs(val).format('YYYY-MM-DD') : '')}
          valueFormat="DD/MM/YYYY"
          required
        />

        <Select
          label={t('pay.method')}
          value={paymentMethod}
          onChange={(v) => setPaymentMethod(v || 'Transfer Bank')}
          data={[
            { value: 'Transfer Bank', label: t('pay.methodTransfer') },
            { value: 'Kas Tunai', label: t('pay.methodCash') },
            { value: 'Giro / Cek', label: t('pay.methodCheck') },
          ]}
        />

        <Select
          label={t('pay.account')}
          value={paymentAccount}
          onChange={(v) => setPaymentAccount(v || '1-10001')}
          data={[
            { value: '1-10001', label: '1-10001 · Kas Operasional Kantor' },
            { value: '1-10002', label: '1-10002 · Bank BCA Bisnis Utama' },
            { value: '1-10003', label: '1-10003 · Bank Mandiri Rekening Giro' },
          ]}
        />

        <Textarea
          label={t('pay.notes')}
          placeholder={t('pay.notesPlaceholder')}
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          rows={2}
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            {t('pay.cancel')}
          </Button>
          <Button color="teal" leftSection={<IconCheck size={16} />} onClick={handleSubmit}>
            {t('pay.confirm')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
