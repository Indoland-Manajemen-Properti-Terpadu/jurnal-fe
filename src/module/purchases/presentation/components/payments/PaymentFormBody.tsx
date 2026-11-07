import { useState } from 'react';
import { Grid, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { IconClipboardText, IconListDetails, IconWallet } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import {
  hasPaymentErrors,
  mergePayableBills,
  payAllBills,
  selectedBillIds,
  toggleBill,
  toPaymentInput,
  toPaymentUpdateInput,
  totalToPay,
  validatePayment,
  type PaymentFormValues,
} from '@/module/purchases/domain/paymentForm';
import type { PartyRef } from '@/module/purchases/domain/purchaseCommon';
import type { PaymentVoucher } from '@/module/purchases/domain/purchaseDocuments';
import { AdvanceSection } from '@/module/purchases/presentation/components/payments/AdvanceSection';
import { PaymentBillsEditor } from '@/module/purchases/presentation/components/payments/PaymentBillsEditor';
import { PaymentMethodField } from '@/module/purchases/presentation/components/payments/PaymentMethodField';
import { PaymentSummaryCard } from '@/module/purchases/presentation/components/payments/PaymentSummaryCard';
import { useUpdatePaymentVoucher } from '@/module/purchases/presentation/components/payments/useUpdatePaymentVoucher';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { SupplierSelect } from '@/module/purchases/presentation/components/shared/LookupSelects';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { useCreatePayment } from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import {
  useBills,
  usePaymentMethodOptions,
} from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const detailPath = (id: string) => routes.purchases.paymentDetail.replace(':id', id);
const BACK = routes.purchases.payments;

interface PaymentFormBodyProps {
  initial: PaymentFormValues;
  initialVendor: PartyRef | null;
  /** The voucher being changed; absent when creating. */
  editing?: PaymentVoucher;
  backTo?: string;
}

export const PaymentFormBody = ({
  initial,
  initialVendor,
  editing,
  backTo,
}: Readonly<PaymentFormBodyProps>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const [values, setValues] = useState<PaymentFormValues>(initial);
  const [showErrors, setShowErrors] = useState(false);
  const isAdvance = values.mode === 'ADVANCE';

  const create = useCreatePayment((doc) => navigate(detailPath(doc.id)));
  const update = useUpdatePaymentVoucher((doc) => navigate(detailPath(doc.id)));
  const saving = create.isPending || update.isPending;

  const billsEnabled = !isAdvance && Boolean(values.vendorId);
  const verified = useBills(
    { vendor: values.vendorId, status: 'VERIFIED', limit: 50 },
    billsEnabled
  );
  const partial = useBills(
    { vendor: values.vendorId, status: 'PARTIAL_PAID', limit: 50 },
    billsEnabled
  );
  const billsLoading = billsEnabled && (verified.isLoading || partial.isLoading);
  const bills = mergePayableBills(verified.data?.items ?? [], partial.data?.items ?? []);
  const { data: methods = [] } = usePaymentMethodOptions();
  const method = methods.find((item) => item.id === values.paymentMethodId);

  const patch = (next: Partial<PaymentFormValues>) =>
    setValues((current) => ({ ...current, ...next }));

  // A bill that is no longer payable (settled meanwhile) must not travel with the voucher.
  const known = new Set(bills.map((bill) => bill.id));
  const effective: PaymentFormValues =
    !isAdvance && !billsLoading
      ? {
          ...values,
          amounts: Object.fromEntries(
            Object.entries(values.amounts).filter(([billId]) => known.has(billId))
          ),
        }
      : values;
  const errors = validatePayment(effective, bills);
  const total = totalToPay(effective);
  const latestBillDate = bills
    .filter((bill) => bill.id in effective.amounts)
    .reduce((latest, bill) => (bill.date > latest ? bill.date : latest), '');

  const submit = () => {
    if (hasPaymentErrors(errors) || billsLoading) {
      setShowErrors(true);
      return;
    }
    if (editing) update.mutate({ id: editing.id, input: toPaymentUpdateInput(effective) });
    else create.mutate(toPaymentInput(effective));
  };

  const title = editing
    ? t('payments.form.titleEdit', { number: editing.number })
    : isAdvance
      ? t('payments.form.titleAdvance')
      : t('payments.form.titleCreate');
  const submitLabel = editing
    ? t('payments.form.submitEdit')
    : isAdvance
      ? t('payments.form.submitAdvance')
      : t('payments.form.submit');

  let dateError: string | undefined;
  if (showErrors && errors.date) {
    dateError = t(
      errors.date === 'required' ? 'payments.form.dateRequired' : 'payments.form.dateBeforeBill'
    );
  }

  return (
    <PageFrame
      icon={IconWallet}
      title={title}
      description={isAdvance ? t('payments.form.subtitleAdvance') : t('payments.form.subtitle')}
      backTo={backTo ?? BACK}
      backLabel={t('common.back')}
    >
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <SectionCard
              icon={IconClipboardText}
              title={t('payments.form.infoTitle')}
              subtitle={t('payments.form.infoSubtitle')}
            >
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <SupplierSelect
                    withAsterisk
                    label={t('common.vendor')}
                    value={values.vendorId || null}
                    selected={initialVendor}
                    disabled={Boolean(editing)}
                    description={editing ? t('payments.form.vendorLocked') : undefined}
                    error={
                      showErrors && errors.vendor ? t('payments.form.vendorRequired') : undefined
                    }
                    onChange={(id) =>
                      patch({ vendorId: id ?? '', amounts: {}, purchaseOrderId: '' })
                    }
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateField
                    withAsterisk
                    label={t('payments.form.date')}
                    value={values.date}
                    minDate={latestBillDate || undefined}
                    onChange={(value) => patch({ date: value })}
                    error={dateError}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <PaymentMethodField
                    value={values.paymentMethodId}
                    onChange={(id) => patch({ paymentMethodId: id })}
                    error={
                      showErrors && errors.method ? t('payments.form.methodRequired') : undefined
                    }
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    radius="md"
                    label={t('payments.form.reference')}
                    placeholder={t('payments.form.referencePlaceholder')}
                    value={values.referenceNumber}
                    maxLength={100}
                    onChange={(event) => patch({ referenceNumber: event.currentTarget.value })}
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
              <AdvanceSection
                values={values}
                showErrors={showErrors}
                amountInvalid={errors.advanceAmount}
                onChange={patch}
              />
            ) : (
              <SectionCard
                icon={IconListDetails}
                title={t('payments.form.billsTitle')}
                subtitle={t('payments.form.billsSubtitle')}
              >
                {!values.vendorId && (
                  <Text size="sm" c="dimmed">
                    {t('payments.form.pickVendorFirst')}
                  </Text>
                )}
                {billsLoading && (
                  <Text size="sm" c="dimmed">
                    {t('payments.form.loadingBills')}
                  </Text>
                )}
                {billsEnabled && !billsLoading && bills.length === 0 && (
                  <Text size="sm" c="dimmed">
                    {t('payments.form.noPayable')}
                  </Text>
                )}
                {bills.length > 0 && (
                  <PaymentBillsEditor
                    bills={bills}
                    values={effective}
                    zeroIds={errors.zeroIds}
                    overIds={errors.overIds}
                    showErrors={showErrors}
                    onToggle={(bill, chosen) => setValues(toggleBill(effective, bill, chosen))}
                    onAmount={(billId, amount) =>
                      patch({ amounts: { ...effective.amounts, [billId]: amount } })
                    }
                    onPayAll={() => setValues(payAllBills(effective, bills))}
                    onClear={() => patch({ amounts: {} })}
                  />
                )}
                {showErrors && errors.noBill && (
                  <Text size="sm" c="red" role="alert">
                    {t('payments.form.noBill')}
                  </Text>
                )}
              </SectionCard>
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }} pos="sticky" top={20}>
          <PaymentSummaryCard
            isAdvance={isAdvance}
            billCount={selectedBillIds(effective).length}
            total={total}
            adminFee={method?.adminFee ?? 0}
            submitLabel={submitLabel}
            loading={saving}
            blockedReason={
              showErrors && hasPaymentErrors(errors) ? t('payments.form.fixErrors') : null
            }
            onSubmit={submit}
            onCancel={() => navigate(backTo ?? BACK)}
          />
        </Grid.Col>
      </Grid>
    </PageFrame>
  );
};
