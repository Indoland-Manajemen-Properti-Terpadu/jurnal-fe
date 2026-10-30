import { useEffect } from 'react';
import {
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
import { t, useTranslation } from '@/i18n';
import type { CreateSalePaymentPayload, Sale } from '../../domain/sale';
import { formatIDR } from '../../domain/saleFormat';
import { remainingAfterPayment } from '../../domain/saleTotals';
import { useDepositAccounts, usePaymentMethods } from '../hooks/useSaleQueries';

type PaySaleModalProps = {
  opened: boolean;
  sale?: Sale | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSalePaymentPayload) => Promise<void>;
};

type PaymentFormValues = {
  depositAccount: string;
  paymentMethod: string;
  paymentDate: string;
  amount: number;
  memo: string;
};

const tr = (key: string) => t(key, undefined, 'sales');

export function PaySaleModal({
  opened,
  sale,
  isSubmitting,
  onClose,
  onSubmit,
}: Readonly<PaySaleModalProps>) {
  const { t: translate } = useTranslation('sales');
  const depositAccountsQuery = useDepositAccounts();
  const paymentMethodsQuery = usePaymentMethods();

  const todayStr = new Date().toISOString().split('T')[0];

  const form = useForm<PaymentFormValues>({
    initialValues: {
      depositAccount: '',
      paymentMethod: '',
      paymentDate: todayStr,
      amount: sale?.remainingAmount || 0,
      memo: '',
    },
    validate: {
      depositAccount: (val) => (!val ? tr('validation.depositAccountRequired') : null),
      paymentMethod: (val) => (!val ? tr('validation.paymentMethodRequired') : null),
      paymentDate: (val) => (!val ? tr('validation.paymentDateRequired') : null),
      amount: (val) => {
        if (!val || val <= 0) return tr('validation.amountPositive');
        if (sale && val > sale.remainingAmount) return tr('validation.amountExceedsRemaining');
        return null;
      },
    },
  });

  useEffect(() => {
    if (sale && opened) {
      form.setValues({
        depositAccount: '',
        paymentMethod: '',
        paymentDate: todayStr,
        amount: sale.remainingAmount || 0,
        memo: t('pay.memoDefault', { number: sale.transactionNumber }, 'sales'),
      });
    }
  }, [sale, opened]);

  const handleSubmit = async (values: PaymentFormValues) => {
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
    label: pm.adminFee
      ? translate('pay.methodWithFee', { name: pm.name, fee: pm.adminFee.toLocaleString('id-ID') })
      : pm.name,
  }));

  const handleMethodChange = (val: string | null) => {
    form.setFieldValue('paymentMethod', val || '');
    if (!val) return;
    const selectedPm = paymentMethodsQuery.data?.find((pm) => pm.id === val);
    const defaultAccount = selectedPm?.defaultAccount;
    const defAccId = typeof defaultAccount === 'object' ? defaultAccount?.id : defaultAccount;
    if (defAccId && !form.values.depositAccount) {
      form.setFieldValue('depositAccount', defAccId);
    }
  };

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
            {translate('pay.title')}
          </Text>
        </Group>
      }
      size="lg"
      radius="lg"
    >
      {sale && (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Paper withBorder p="sm" radius="md" bg="gray.0">
              <Grid gutter="xs">
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    {translate('pay.invoiceNumber')}
                  </Text>
                  <Text size="sm" fw={700} c="primary.9">
                    {sale.transactionNumber}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    {translate('pay.customer')}
                  </Text>
                  <Text size="sm" fw={600} c="dark.8">
                    {sale.customer?.displayName || '—'}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    {translate('pay.invoiceTotal')}
                  </Text>
                  <Text size="sm" fw={600} c="dark.8">
                    {formatIDR(sale.finalAmount)}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    {translate('pay.remaining')}
                  </Text>
                  <Text size="sm" fw={800} c="orange.8">
                    {formatIDR(sale.remainingAmount)}
                  </Text>
                </Grid.Col>
              </Grid>
            </Paper>

            <Select
              label={translate('pay.depositAccount')}
              placeholder={translate('pay.depositAccountPlaceholder')}
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
                  label={translate('pay.method')}
                  placeholder={translate('pay.methodPlaceholder')}
                  data={paymentMethodOptions}
                  searchable
                  required
                  value={form.values.paymentMethod}
                  onChange={handleMethodChange}
                  error={form.errors.paymentMethod}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  type="date"
                  label={translate('pay.paymentDate')}
                  leftSection={<IconCalendar size={16} />}
                  required
                  {...form.getInputProps('paymentDate')}
                />
              </Grid.Col>
            </Grid>

            <NumberInput
              label={translate('pay.amount')}
              description={translate('pay.amountDescription')}
              thousandSeparator="."
              decimalSeparator=","
              min={1}
              max={sale.remainingAmount}
              leftSection={<IconCoin size={16} />}
              required
              {...form.getInputProps('amount')}
            />

            <Textarea
              label={translate('pay.memo')}
              placeholder={translate('pay.memoPlaceholder')}
              minRows={2}
              {...form.getInputProps('memo')}
            />

            {form.values.amount < sale.remainingAmount && (
              <Alert icon={<IconAlertCircle size={16} />} color="yellow" radius="md">
                {translate('pay.partialBefore')} <strong>{translate('pay.partialStatus')}</strong>{' '}
                {translate('pay.partialMiddle')}{' '}
                <strong>
                  {formatIDR(remainingAfterPayment(sale.remainingAmount, form.values.amount))}
                </strong>{' '}
                {translate('pay.partialAfter')}
              </Alert>
            )}

            <Divider />

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={onClose} disabled={isSubmitting}>
                {translate('pay.cancel')}
              </Button>
              <Button type="submit" color="primary" loading={isSubmitting}>
                {translate('pay.save')}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}

export default PaySaleModal;
