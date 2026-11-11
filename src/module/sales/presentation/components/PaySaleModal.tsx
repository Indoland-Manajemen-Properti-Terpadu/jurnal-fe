import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Anchor,
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
  TextInput,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconAlertCircle,
  IconBuildingBank,
  IconCalendar,
  IconCheck,
  IconCoin,
  IconPaperclip,
  IconReceipt2,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { CreateSalePaymentPayload, Sale, SalePaymentResult } from '@/module/sales/domain/sale';
import { formatIDR } from '@/module/sales/domain/saleFormat';
import {
  emptyPaymentForm,
  overpaymentOf,
  paymentKind,
  toPaymentPayload,
  validatePayment,
  type PaymentFormValues,
  type PaymentTarget,
} from '@/module/sales/domain/salePayment';
import { remainingAfterPayment } from '@/module/sales/domain/saleTotals';
import {
  useDepositAccounts,
  useOverpaymentAccount,
  usePaymentMethods,
  useSaleDetail,
} from '../hooks/useSaleQueries';
import { SaleTagField } from './shared/SaleTagField';
import { PaymentAllocation, type AllocationLine } from './pay/PaymentAllocation';
import { PaymentResultView } from './pay/PaymentResultView';

type PaySaleModalProps = {
  opened: boolean;
  sale?: Sale | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSalePaymentPayload) => Promise<SalePaymentResult>;
};

const localToday = (): string => new Date().toLocaleDateString('en-CA');

export function PaySaleModal({
  opened,
  sale,
  isSubmitting,
  onClose,
  onSubmit,
}: Readonly<PaySaleModalProps>) {
  const { t } = useTranslation('sales');
  const accountsQuery = useDepositAccounts();
  const methodsQuery = usePaymentMethods();

  // The invoice's own lines (id, open balance, open late fee) come from the detail call.
  const detailQuery = useSaleDetail(opened ? sale?.id : undefined);
  const invoice = detailQuery.data ?? sale;
  const [result, setResult] = useState<SalePaymentResult | null>(null);

  const remaining = invoice?.remainingAmount ?? 0;
  const form = useForm<PaymentFormValues>({ initialValues: emptyPaymentForm(localToday(), 0) });

  useEffect(() => {
    if (sale && opened) {
      form.setValues(emptyPaymentForm(localToday(), sale.remainingAmount));
      form.resetDirty();
      form.clearErrors();
      setResult(null);
    }
    // The form is re-seeded only when a different invoice opens the modal.
  }, [sale?.id, opened]);

  const lines: AllocationLine[] = useMemo(
    () =>
      (invoice?.items ?? [])
        .filter((item) => item.id)
        .map((item) => ({
          id: item.id as string,
          name: item.product?.name || item.description || '—',
          outstandingAmount: item.outstandingAmount ?? 0,
        })),
    [invoice]
  );
  const target: PaymentTarget = {
    remaining,
    outstandingLateFee: invoice?.outstandingLateFee ?? 0,
    items: lines.map(({ id, outstandingAmount }) => ({ id, outstandingAmount })),
  };

  const kind = paymentKind(form.values.amount, remaining);
  const overpayment = overpaymentOf(form.values.amount, remaining);
  const overpaymentAccount = useOverpaymentAccount(opened && kind === 'overpaid');
  const mappingMissing =
    kind === 'overpaid' && overpaymentAccount.isSuccess && !overpaymentAccount.data;

  const accountOptions = accountsQuery.data ?? [];
  const methodOptions = (methodsQuery.data ?? []).map((method) => ({
    value: method.id,
    label: method.adminFee
      ? t('pay.methodWithFee', { name: method.name, fee: method.adminFee.toLocaleString('id-ID') })
      : method.name,
  }));

  const changeMethod = (value: string | null) => {
    form.setFieldValue('paymentMethod', value || '');
    const method = methodsQuery.data?.find((item) => item.id === value);
    const account = method?.defaultAccount;
    const accountId = typeof account === 'object' ? account?.id : account;
    if (accountId && !form.values.depositAccount) {
      if (accountOptions.some((option) => option.value === accountId)) {
        form.setFieldValue('depositAccount', accountId);
      }
    }
  };

  const submit = async () => {
    if (!sale || !invoice) return;
    const errors = validatePayment(form.values, remaining, target);
    form.setErrors(Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, t(v)])));
    if (Object.keys(errors).length > 0) return;
    const payload = toPaymentPayload(sale.id, form.values, remaining);
    const saved = await onSubmit(payload);
    if (payload.autoAllocate && saved.items.length > 0) setResult(saved);
    else onClose();
  };

  const lineNames = Object.fromEntries(lines.map((line) => [line.id, line.name]));
  const isFull = kind !== 'partial';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size={28} radius="md" color="primary" variant="light">
            <IconReceipt2 size={16} />
          </ThemeIcon>
          <Text fw={700}>{t('pay.title')}</Text>
        </Group>
      }
      size="lg"
      radius="lg"
    >
      {sale && result && (
        <PaymentResultView result={result} lineNames={lineNames} onClose={onClose} />
      )}
      {sale && !result && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Stack gap="md">
            <Paper withBorder p="sm" radius="md" bg="gray.0">
              <Grid gutter="xs">
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    {t('pay.invoiceNumber')}
                  </Text>
                  <Text size="sm" fw={700}>
                    {sale.transactionNumber}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    {t('pay.customer')}
                  </Text>
                  <Text size="sm" fw={600}>
                    {sale.customer?.displayName || '—'}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    {t('pay.invoiceTotal')}
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatIDR(sale.finalAmount)}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    {t('pay.remaining')}
                  </Text>
                  <Text size="sm" fw={800}>
                    {formatIDR(remaining)}
                  </Text>
                </Grid.Col>
              </Grid>
            </Paper>

            <Select
              label={t('pay.depositAccount')}
              placeholder={t('pay.depositAccountPlaceholder')}
              nothingFoundMessage={t('pay.depositAccountEmpty')}
              data={accountOptions}
              searchable
              clearable
              leftSection={<IconBuildingBank size={16} />}
              withAsterisk
              {...form.getInputProps('depositAccount')}
            />

            <Grid gutter="sm">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label={t('pay.method')}
                  placeholder={t('pay.methodPlaceholder')}
                  data={methodOptions}
                  searchable
                  withAsterisk
                  value={form.values.paymentMethod}
                  onChange={changeMethod}
                  error={form.errors.paymentMethod}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  type="date"
                  label={t('pay.paymentDate')}
                  leftSection={<IconCalendar size={16} />}
                  withAsterisk
                  {...form.getInputProps('paymentDate')}
                />
              </Grid.Col>
            </Grid>

            <NumberInput
              label={t('pay.amount')}
              description={t('pay.amountDescription')}
              inputWrapperOrder={['label', 'input', 'description', 'error']}
              thousandSeparator="."
              decimalSeparator=","
              decimalScale={2}
              min={0}
              leftSection={<IconCoin size={16} />}
              withAsterisk
              {...form.getInputProps('amount')}
            />

            {kind === 'partial' && (
              <PaymentAllocation
                values={form.values}
                lines={lines}
                outstandingLateFee={target.outstandingLateFee}
                errors={form.errors}
                onMode={(mode) => form.setFieldValue('allocation', mode)}
                onItemAmount={(itemId, amount) =>
                  form.setFieldValue('itemAmounts', {
                    ...form.values.itemAmounts,
                    [itemId]: amount,
                  })
                }
                onLateFee={(amount) => form.setFieldValue('lateFee', amount)}
              />
            )}

            <SaleTagField
              label={t('pay.tags')}
              placeholder={t('pay.tagsPlaceholder')}
              value={form.values.tags}
              onChange={(value) => form.setFieldValue('tags', value)}
            />

            <Textarea
              label={t('pay.memo')}
              placeholder={t('pay.memoPlaceholder')}
              minRows={2}
              autosize
              {...form.getInputProps('memo')}
            />

            <FileInput
              multiple
              clearable
              label={t('pay.attachments')}
              placeholder={t('pay.attachmentsPlaceholder')}
              description={t('pay.attachmentsHint')}
              inputWrapperOrder={['label', 'input', 'description', 'error']}
              leftSection={<IconPaperclip size={16} />}
              value={form.values.attachments}
              onChange={(files) => form.setFieldValue('attachments', files)}
              error={form.errors.attachments}
            />

            {kind === 'overpaid' && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color={mappingMissing ? 'orange' : 'primary'}
                variant="light"
                radius="md"
              >
                {mappingMissing ? (
                  <>
                    {t('pay.overpaymentNoMapping')}{' '}
                    <Anchor component={Link} to={routes.settings.accountMapping} size="sm">
                      {t('pay.overpaymentMappingLink')}
                    </Anchor>
                  </>
                ) : (
                  t('pay.overpaymentNotice', {
                    amount: formatIDR(overpayment),
                    account: overpaymentAccount.data
                      ? `${overpaymentAccount.data.accountNumber ?? ''} ${overpaymentAccount.data.name}`.trim()
                      : '…',
                  })
                )}
              </Alert>
            )}

            <Alert
              icon={isFull ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
              color={isFull ? 'gray' : 'primary'}
              variant="light"
              radius="md"
            >
              {isFull
                ? t(kind === 'overpaid' ? 'pay.overpaidNotice' : 'pay.fullNotice')
                : t('pay.partialNotice', {
                    remaining: formatIDR(remainingAfterPayment(remaining, form.values.amount || 0)),
                  })}
            </Alert>

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={onClose} disabled={isSubmitting}>
                {t('pay.cancel')}
              </Button>
              <Button
                type="submit"
                color="primary"
                loading={isSubmitting}
                disabled={mappingMissing || (kind === 'partial' && !invoice)}
              >
                {t('pay.save')}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}

export default PaySaleModal;
