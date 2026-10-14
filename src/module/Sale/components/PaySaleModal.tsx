import { useEffect } from 'react';
import {
  ActionIcon,
  Alert,
  Button,
  Divider,
  Grid,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconAlertCircle,
  IconBuildingBank,
  IconCalendar,
  IconCoin,
  IconReceipt2,
} from '@tabler/icons-react';
import type { CreateSalePaymentPayload, Sale } from '../types/sale';
import { useDepositAccounts, usePaymentMethods } from '../hooks/useSaleQueries';
import { formatIDR } from '../utils/saleFormat';

type PaySaleModalProps = {
  opened: boolean;
  sale?: Sale | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSalePaymentPayload) => Promise<void>;
};

export function PaySaleModal({
  opened,
  sale,
  isSubmitting,
  onClose,
  onSubmit,
}: Readonly<PaySaleModalProps>) {
  const depositAccountsQuery = useDepositAccounts();
  const paymentMethodsQuery = usePaymentMethods();

  const todayStr = new Date().toISOString().split('T')[0];

  const form = useForm<{
    depositAccount: string;
    paymentMethod: string;
    paymentDate: string;
    amount: number;
    memo: string;
  }>({
    initialValues: {
      depositAccount: '',
      paymentMethod: '',
      paymentDate: todayStr,
      amount: sale?.remainingAmount || 0,
      memo: '',
    },
    validate: {
      depositAccount: (val) => (!val ? 'Pilih akun kas atau bank penerima' : null),
      paymentMethod: (val) => (!val ? 'Pilih metode pembayaran' : null),
      paymentDate: (val) => (!val ? 'Tanggal pembayaran wajib diisi' : null),
      amount: (val) =>
        !val || val <= 0
          ? 'Jumlah pembayaran harus lebih dari 0'
          : sale && val > sale.remainingAmount
          ? 'Jumlah tidak boleh melebihi sisa tagihan'
          : null,
    },
  });

  useEffect(() => {
    if (sale && opened) {
      form.setValues({
        depositAccount: '',
        paymentMethod: '',
        paymentDate: todayStr,
        amount: sale.remainingAmount || 0,
        memo: `Pembayaran faktur ${sale.transactionNumber}`,
      });
    }
  }, [sale, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!sale) return;
    await onSubmit({
      sale: sale.id,
      depositAccount: values.depositAccount,
      paymentMethod: values.paymentMethod,
      paymentDate: values.paymentDate,
      amount: values.amount,
      memo: values.memo || null,
      tags: [],
    });
  };

  const accountOptions = (depositAccountsQuery.data || []).map((acc) => ({
    value: acc.value,
    label: acc.label,
  }));

  const paymentMethodOptions = (paymentMethodsQuery.data || []).map((pm) => ({
    value: pm.id,
    label: pm.adminFee ? `${pm.name} (Biaya: Rp ${pm.adminFee.toLocaleString('id-ID')})` : pm.name,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size={28} radius="md" color="teal" variant="light">
            <IconReceipt2 size={16} />
          </ThemeIcon>
          <Text fw={700} c="primary.9">
            Catat Pembayaran Faktur
          </Text>
        </Group>
      }
      size="lg"
      radius="lg"
    >
      {sale && (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {/* Invoice Summary Box */}
            <Paper withBorder p="sm" radius="md" bg="gray.0">
              <Grid gutter="xs">
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    Nomor Faktur
                  </Text>
                  <Text size="sm" fw={700} c="primary.9">
                    {sale.transactionNumber}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    Pelanggan
                  </Text>
                  <Text size="sm" fw={600} c="dark.8">
                    {sale.customer?.displayName || '—'}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    Total Nilai Faktur
                  </Text>
                  <Text size="sm" fw={600} c="dark.8">
                    {formatIDR(sale.finalAmount)}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    Sisa Tagihan
                  </Text>
                  <Text size="sm" fw={800} c="orange.8">
                    {formatIDR(sale.remainingAmount)}
                  </Text>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Payment Fields */}
            <Select
              label="Setor ke Akun (Kas & Bank)"
              placeholder="Pilih rekening bank atau kas penerima..."
              data={accountOptions}
              searchable
              clearable
              leftSection={<IconBuildingBank size={16} />}
              required
              {...form.getInputProps('depositAccount')}
            />

            <Grid gutter="sm">
              <Grid.Col span={6}>
                <Select
                  label="Cara Pembayaran"
                  placeholder="Pilih metode transfer/va..."
                  data={paymentMethodOptions}
                  searchable
                  required
                  {...form.getInputProps('paymentMethod')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  type="date"
                  label="Tanggal Pembayaran"
                  leftSection={<IconCalendar size={16} />}
                  required
                  {...form.getInputProps('paymentDate')}
                />
              </Grid.Col>
            </Grid>

            <NumberInput
              label="Jumlah Pembayaran (Rp)"
              description="Dapat dicicil/dibayar sebagian"
              thousandSeparator="."
              decimalSeparator=","
              min={1}
              max={sale.remainingAmount}
              leftSection={<IconCoin size={16} />}
              required
              {...form.getInputProps('amount')}
            />

            <Textarea
              label="Catatan / Memo"
              placeholder="Tambahkan catatan bukti transfer atau referensi..."
              minRows={2}
              {...form.getInputProps('memo')}
            />

            {form.values.amount < sale.remainingAmount && (
              <Alert icon={<IconAlertCircle size={16} />} color="yellow" radius="md">
                Pembayaran ini hanya melunasi sebagian. Status faktur akan menjadi{' '}
                <strong>Sebagian (PARTIAL)</strong> dan sisa{' '}
                <strong>{formatIDR(sale.remainingAmount - form.values.amount)}</strong> tetap
                terbuka sebagai piutang.
              </Alert>
            )}

            <Divider />

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={onClose} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" color="primary" loading={isSubmitting}>
                Simpan Pembayaran
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}

export default PaySaleModal;

