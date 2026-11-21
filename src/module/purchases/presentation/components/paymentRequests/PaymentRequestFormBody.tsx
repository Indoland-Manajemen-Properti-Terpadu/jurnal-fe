import { useMemo, useState } from 'react';
import { Grid, NumberInput, Select, SegmentedControl, Stack, Text, Textarea } from '@mantine/core';
import { IconClipboardText, IconCoins, IconListDetails, IconSum } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import {
  hasPaymentRequestErrors,
  requestableBills,
  toPaymentRequestInput,
  toPaymentRequestUpdate,
  validatePaymentRequestForm,
  type PaymentRequest,
  type PaymentRequestFormValues,
  type PaymentRequestKind,
} from '@/module/purchases/domain/paymentRequest';
import type { PartyRef } from '@/module/purchases/domain/purchaseCommon';
import { sumMinor, toMinor } from '@/lib/money/money';
import { detailPath } from '@/module/purchases/presentation/components/hub/documentPaths';
import { RequestableBillsEditor } from '@/module/purchases/presentation/components/paymentRequests/RequestableBillsEditor';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { FormActions } from '@/module/purchases/presentation/components/shared/FormActions';
import { SupplierSelect } from '@/module/purchases/presentation/components/shared/LookupSelects';
import { MoneyRows } from '@/module/purchases/presentation/components/shared/MoneyRows';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import {
  useCreatePaymentRequest,
  useUpdatePaymentRequest,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { useBills, useOrders } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.paymentRequests;

interface PaymentRequestFormBodyProps {
  initial: PaymentRequestFormValues;
  initialVendor: PartyRef | null;
  /** The draft being changed; absent when creating. */
  editing?: PaymentRequest;
  backTo?: string;
}

export const PaymentRequestFormBody = ({
  initial,
  initialVendor,
  editing,
  backTo,
}: Readonly<PaymentRequestFormBodyProps>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const [values, setValues] = useState<PaymentRequestFormValues>(initial);
  const [vendorId, setVendorId] = useState(initialVendor?.id ?? '');
  const [showErrors, setShowErrors] = useState(false);
  const isAdvance = values.kind === 'DP';

  const create = useCreatePaymentRequest((doc) => navigate(detailPath('paymentRequest', doc.id)));
  const update = useUpdatePaymentRequest((doc) => navigate(detailPath('paymentRequest', doc.id)));
  const saving = create.isPending || update.isPending;

  const billsEnabled = !isAdvance && Boolean(vendorId);
  const billsQuery = useBills(
    { vendor: vendorId, status: ['VERIFIED', 'PARTIAL_PAID'], limit: 100 },
    billsEnabled
  );
  const ordersQuery = useOrders({ vendor: vendorId, limit: 100 }, isAdvance && Boolean(vendorId));

  // A draft already holds part of each bill, so while editing it may ask for that part again.
  const own = useMemo(
    () => Object.fromEntries((editing?.items ?? []).map((item) => [item.bill.id, item.amount])),
    [editing]
  );
  const bills = useMemo(
    () =>
      requestableBills(billsQuery.data?.items ?? []).map((bill) => ({
        ...bill,
        requestable: sumMinor([toMinor(bill.requestable), toMinor(own[bill.id] ?? 0)]) / 100,
      })),
    [billsQuery.data, own]
  );
  const orders = (ordersQuery.data?.items ?? []).filter(
    (order) => order.advance.available > 0 || order.id === values.purchaseOrderId
  );
  const order = orders.find((item) => item.id === values.purchaseOrderId);
  const available =
    order && editing
      ? sumMinor([toMinor(order.advance.available), toMinor(editing.amount)]) / 100
      : order?.advance.available;

  const errors = validatePaymentRequestForm(values, {
    requestable: Object.fromEntries(bills.map((bill) => [bill.id, bill.requestable])),
    available,
  });
  const total = isAdvance
    ? typeof values.advanceAmount === 'number'
      ? values.advanceAmount
      : 0
    : sumMinor(Object.values(values.amounts).map((amount) => toMinor(amount || 0))) / 100;

  const patch = (next: Partial<PaymentRequestFormValues>) =>
    setValues((current) => ({ ...current, ...next }));

  const submit = () => {
    if (hasPaymentRequestErrors(errors)) {
      setShowErrors(true);
      return;
    }
    if (editing) {
      update.mutate({ id: editing.id, input: toPaymentRequestUpdate(values) });
    } else {
      create.mutate(toPaymentRequestInput(values));
    }
  };

  const changeKind = (kind: PaymentRequestKind) => {
    setValues((current) => ({
      ...current,
      kind,
      amounts: {},
      purchaseOrderId: '',
      advanceAmount: '',
    }));
    setShowErrors(false);
  };

  return (
    <PageFrame
      icon={IconCoins}
      title={
        editing
          ? t('paymentRequests.form.titleEdit', { number: editing.number })
          : t('paymentRequests.form.titleCreate')
      }
      description={t('paymentRequests.form.subtitle')}
      backTo={backTo ?? BACK}
      backLabel={t('common.back')}
    >
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <SectionCard
              icon={IconClipboardText}
              title={t('paymentRequests.form.infoTitle')}
              subtitle={t('paymentRequests.form.infoSubtitle')}
            >
              <Grid gutter="md">
                <Grid.Col span={12}>
                  <Text size="sm" fw={500} mb={4}>
                    {t('paymentRequests.form.kindTitle')}
                  </Text>
                  <SegmentedControl
                    fullWidth
                    radius="md"
                    value={values.kind}
                    disabled={Boolean(editing)}
                    onChange={(value) => changeKind(value as PaymentRequestKind)}
                    data={(['SETTLEMENT', 'DP'] as const).map((kind) => ({
                      value: kind,
                      label: t(`paymentRequests.kinds.${kind}`),
                    }))}
                  />
                  <Text size="xs" c="dimmed" mt={4}>
                    {editing
                      ? t('paymentRequests.form.kindLocked')
                      : t('paymentRequests.form.kindSubtitle')}
                  </Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <SupplierSelect
                    withAsterisk
                    label={t('paymentRequests.form.vendor')}
                    value={vendorId || null}
                    selected={initialVendor}
                    disabled={Boolean(editing)}
                    description={editing ? t('paymentRequests.form.vendorLocked') : undefined}
                    error={
                      showErrors && !vendorId ? t('paymentRequests.form.vendorRequired') : undefined
                    }
                    onChange={(id) => {
                      setVendorId(id ?? '');
                      patch({ amounts: {}, purchaseOrderId: '', advanceAmount: '' });
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateField
                    withAsterisk
                    label={t('paymentRequests.form.date')}
                    value={values.date}
                    onChange={(value) => patch({ date: value })}
                    error={
                      showErrors && errors.date ? t('paymentRequests.form.dateRequired') : undefined
                    }
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    radius="md"
                    label={t('common.memo')}
                    value={values.memo}
                    minRows={2}
                    autosize
                    maxLength={500}
                    onChange={(event) => patch({ memo: event.currentTarget.value })}
                  />
                </Grid.Col>
              </Grid>
            </SectionCard>

            {isAdvance ? (
              <SectionCard
                icon={IconListDetails}
                title={t('paymentRequests.form.orderTitle')}
                subtitle={t('paymentRequests.form.orderSubtitle')}
              >
                {!vendorId && (
                  <Text size="sm" c="dimmed">
                    {t('paymentRequests.form.pickVendorFirst')}
                  </Text>
                )}
                {vendorId && !ordersQuery.isLoading && orders.length === 0 && (
                  <Text size="sm" c="dimmed">
                    {t('paymentRequests.form.noOrders')}
                  </Text>
                )}
                {vendorId && orders.length > 0 && (
                  <Stack gap="md">
                    <Select
                      radius="md"
                      withAsterisk
                      searchable
                      label={t('paymentRequests.form.order')}
                      placeholder={t('paymentRequests.form.orderPlaceholder')}
                      disabled={Boolean(editing)}
                      data={orders.map((item) => ({ value: item.id, label: item.number }))}
                      value={values.purchaseOrderId || null}
                      onChange={(id) => {
                        const picked = orders.find((item) => item.id === id);
                        patch({
                          purchaseOrderId: id ?? '',
                          advanceAmount: picked ? picked.advance.available : '',
                        });
                      }}
                      error={
                        showErrors && errors.order
                          ? t('paymentRequests.form.orderRequired')
                          : undefined
                      }
                    />
                    {order && (
                      <Text size="xs" c="dimmed">
                        {t('paymentRequests.form.orderHint', {
                          amount: formatAmount(order.advance.amount),
                          requested: formatAmount(order.advance.requested),
                          available: formatAmount(available ?? 0),
                        })}
                      </Text>
                    )}
                    <NumberInput
                      radius="md"
                      withAsterisk
                      label={t('paymentRequests.form.advanceAmount')}
                      value={values.advanceAmount}
                      min={0}
                      hideControls
                      allowNegative={false}
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      prefix="Rp "
                      onChange={(value) =>
                        patch({ advanceAmount: typeof value === 'number' ? value : '' })
                      }
                      error={
                        showErrors && errors.advance
                          ? errors.advance === 'advanceTooHigh'
                            ? t('paymentRequests.form.advanceTooHigh', {
                                max: formatAmount(available ?? 0),
                              })
                            : t('paymentRequests.form.advanceInvalid')
                          : undefined
                      }
                    />
                  </Stack>
                )}
              </SectionCard>
            ) : (
              <SectionCard
                icon={IconListDetails}
                title={t('paymentRequests.form.billsTitle')}
                subtitle={t('paymentRequests.form.billsSubtitle')}
              >
                {!vendorId && (
                  <Text size="sm" c="dimmed">
                    {t('paymentRequests.form.pickVendorFirst')}
                  </Text>
                )}
                {billsEnabled && billsQuery.isLoading && (
                  <Text size="sm" c="dimmed">
                    {t('paymentRequests.form.loadingBills')}
                  </Text>
                )}
                {billsEnabled && !billsQuery.isLoading && bills.length === 0 && (
                  <Text size="sm" c="dimmed">
                    {t('paymentRequests.form.noBills')}
                  </Text>
                )}
                {bills.length > 0 && (
                  <RequestableBillsEditor
                    bills={bills}
                    values={values}
                    errors={errors}
                    showErrors={showErrors}
                    onChange={(amounts) => patch({ amounts })}
                  />
                )}
                {showErrors && errors.noBills && (
                  <Text size="sm" c="red" role="alert">
                    {t('paymentRequests.form.noBillChosen')}
                  </Text>
                )}
              </SectionCard>
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }} pos="sticky" top={20}>
          <SectionCard icon={IconSum} title={t('paymentRequests.form.summaryTitle')}>
            <Text size="sm">
              {isAdvance
                ? total > 0
                  ? t('paymentRequests.form.summaryAdvance')
                  : t('paymentRequests.form.summaryNone')
                : Object.keys(values.amounts).length > 0
                  ? t('paymentRequests.form.summaryBills', {
                      count: Object.keys(values.amounts).length,
                    })
                  : t('paymentRequests.form.summaryNone')}
            </Text>
            <MoneyRows
              rows={[
                {
                  label: t('paymentRequests.form.total'),
                  amount: formatAmount(total),
                  emphasis: 'total',
                },
              ]}
            />
            <Text size="xs" c="dimmed">
              {t('paymentRequests.form.draftNote')}
            </Text>
            {showErrors && hasPaymentRequestErrors(errors) && (
              <Text size="xs" c="red" role="alert">
                {t('paymentRequests.form.fixErrors')}
              </Text>
            )}
            <FormActions
              loading={saving}
              submitLabel={
                editing ? t('paymentRequests.form.saveEdit') : t('paymentRequests.form.save')
              }
              onSubmit={submit}
              onCancel={() => navigate(backTo ?? BACK)}
            />
          </SectionCard>
        </Grid.Col>
      </Grid>
    </PageFrame>
  );
};
