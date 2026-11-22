import { useMemo, useState } from 'react';
import { Alert, Grid, Group, SimpleGrid, Stack, Text, Textarea } from '@mantine/core';
import {
  IconCalendar,
  IconClipboardText,
  IconCoins,
  IconDeviceFloppy,
  IconInfoCircle,
  IconListDetails,
  IconReceipt2,
} from '@tabler/icons-react';
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
import { PaymentRequestAmountFields } from '@/module/purchases/presentation/components/paymentRequests/PaymentRequestAmountFields';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { FormFrame } from '@/module/purchases/presentation/components/shared/FormFrame';
import { SupplierSelect } from '@/module/purchases/presentation/components/shared/LookupSelects';
import { ChoiceCard } from '@/module/purchases/presentation/components/shared/wizard/ChoiceCard';
import { WizardActionBar } from '@/module/purchases/presentation/components/shared/wizard/WizardActionBar';
import { WizardCard } from '@/module/purchases/presentation/components/shared/wizard/WizardCard';
import {
  WizardStepper,
  type WizardStep,
} from '@/module/purchases/presentation/components/shared/wizard/WizardStepper';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import {
  useCreatePaymentRequest,
  useUpdatePaymentRequest,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { useBills, useOrders } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.payments;

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
  const [step, setStep] = useState(0);
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
    if (hasPaymentRequestErrors(errors) || !vendorId) {
      setShowErrors(true);
      setStep(!vendorId ? 0 : errors.date ? 2 : 1);
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

  const steps: WizardStep[] = [
    {
      id: 'source',
      label: t('paymentRequests.wizard.source'),
      description: t('paymentRequests.wizard.sourceHint'),
      icon: <IconClipboardText size={20} />,
    },
    {
      id: 'amount',
      label: t('paymentRequests.wizard.amount'),
      description: t('paymentRequests.wizard.amountHint'),
      icon: <IconListDetails size={20} />,
    },
    {
      id: 'data',
      label: t('paymentRequests.wizard.data'),
      description: t('paymentRequests.wizard.dataHint'),
      icon: <IconCalendar size={20} />,
    },
  ];
  const stepOk = [
    Boolean(vendorId),
    !errors.noBills && !errors.order && !errors.advance && Object.keys(errors.bills).length === 0,
    !errors.date,
  ];
  const next = () => {
    if (!stepOk[step]) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep(step + 1);
  };
  const pickedCount = Object.keys(values.amounts).length;
  const summary = (
    <Group justify="space-between" wrap="nowrap">
      <Text size="sm" c="dimmed">
        {isAdvance
          ? total > 0
            ? t('paymentRequests.form.summaryAdvance')
            : t('paymentRequests.form.summaryNone')
          : pickedCount > 0
            ? t('paymentRequests.form.summaryBills', { count: pickedCount })
            : t('paymentRequests.form.summaryNone')}
      </Text>
      <Text size="lg" fw={700} c="primary.8">
        {formatAmount(total)}
      </Text>
    </Group>
  );
  const finish = {
    label: editing ? t('paymentRequests.form.saveEdit') : t('paymentRequests.form.save'),
    icon: <IconDeviceFloppy size={16} />,
    loading: saving,
    onClick: submit,
  };
  const bar = (
    <WizardActionBar
      isFirst={step === 0}
      isLast={step === steps.length - 1}
      busy={saving}
      onCancel={() => navigate(backTo ?? BACK)}
      onBack={() => setStep(step - 1)}
      onNext={next}
      finish={finish}
    />
  );

  return (
    <FormFrame
      icon={IconCoins}
      title={
        editing
          ? t('paymentRequests.form.titleEdit', { number: editing.number })
          : t('paymentRequests.form.titleCreate')
      }
      description={t('paymentRequests.form.subtitle')}
      backTo={backTo ?? BACK}
      backLabel={t('paymentRequests.form.backToList')}
    >
      <WizardStepper steps={steps} active={step} onStepClick={setStep} />

      {step === 0 && (
        <WizardCard
          icon={<IconClipboardText size={20} />}
          title={t('paymentRequests.wizard.source')}
          description={t('paymentRequests.wizard.sourceHint')}
          footer={bar}
        >
          <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <ChoiceCard
                icon={<IconReceipt2 size={18} />}
                title={t('paymentRequests.kinds.SETTLEMENT')}
                description={t('paymentRequests.wizard.settlementDesc')}
                selected={!isAdvance}
                disabled={Boolean(editing)}
                onSelect={() => changeKind('SETTLEMENT')}
              />
              <ChoiceCard
                icon={<IconCoins size={18} />}
                title={t('paymentRequests.kinds.DP')}
                description={t('paymentRequests.wizard.advanceDesc')}
                selected={isAdvance}
                disabled={Boolean(editing)}
                onSelect={() => changeKind('DP')}
              />
            </SimpleGrid>
            <SupplierSelect
              withAsterisk
              label={t('paymentRequests.form.vendor')}
              value={vendorId || null}
              selected={initialVendor}
              disabled={Boolean(editing)}
              description={
                editing
                  ? t('paymentRequests.form.vendorLocked')
                  : t('paymentRequests.wizard.vendorHint')
              }
              error={showErrors && !vendorId ? t('paymentRequests.form.vendorRequired') : undefined}
              onChange={(id) => {
                setVendorId(id ?? '');
                patch({ amounts: {}, purchaseOrderId: '', advanceAmount: '' });
              }}
            />
            {!vendorId && (
              <Alert color="blue" variant="light" radius="md" icon={<IconInfoCircle size={16} />}>
                {t('paymentRequests.form.pickVendorFirst')}
              </Alert>
            )}
          </Stack>
        </WizardCard>
      )}

      {step === 1 && (
        <WizardCard
          icon={<IconListDetails size={20} />}
          title={
            isAdvance ? t('paymentRequests.form.orderTitle') : t('paymentRequests.form.billsTitle')
          }
          description={
            isAdvance
              ? t('paymentRequests.form.orderSubtitle')
              : t('paymentRequests.form.billsSubtitle')
          }
          summary={summary}
          footer={bar}
        >
          <PaymentRequestAmountFields
            isAdvance={isAdvance}
            editing={Boolean(editing)}
            values={values}
            errors={errors}
            showErrors={showErrors}
            bills={bills}
            billsLoading={billsQuery.isLoading}
            orders={orders}
            ordersLoading={ordersQuery.isLoading}
            order={order}
            available={available}
            onChange={patch}
          />
        </WizardCard>
      )}

      {step === 2 && (
        <WizardCard
          icon={<IconCalendar size={20} />}
          title={t('paymentRequests.wizard.data')}
          description={t('paymentRequests.wizard.dataHint')}
          summary={summary}
          footer={bar}
        >
          <Grid gutter="md">
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
                minRows={3}
                autosize
                maxLength={500}
                onChange={(event) => patch({ memo: event.currentTarget.value })}
              />
            </Grid.Col>
          </Grid>
          {showErrors && hasPaymentRequestErrors(errors) && (
            <Text size="xs" c="red" mt="sm" role="alert">
              {t('paymentRequests.form.fixErrors')}
            </Text>
          )}
        </WizardCard>
      )}
    </FormFrame>
  );
};
