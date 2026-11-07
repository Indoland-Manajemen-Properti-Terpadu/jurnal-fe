import { useMemo, useState } from 'react';
import { Anchor, Grid, NumberInput, Select, Stack, Text, TextInput, Textarea } from '@mantine/core';
import {
  IconCalculator,
  IconClipboardText,
  IconFileInvoice,
  IconListDetails,
} from '@tabler/icons-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import {
  billableLines,
  billToForm,
  defaultBillForm,
  detectVariances,
  dueDateFor,
  estimateBill,
  hasBillErrors,
  isCustomized,
  toBillInput,
  toBillUpdateInput,
  toNumber,
  validateBill,
  type BillFormValues,
  type BillLineValues,
} from '@/module/purchases/domain/billForm';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { billActions } from '@/module/purchases/domain/purchaseActions';
import type { PurchaseBill, PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import { BillLinesEditor } from '@/module/purchases/presentation/components/bills/BillLinesEditor';
import { BillVarianceNotice } from '@/module/purchases/presentation/components/bills/BillVarianceNotice';
import { useUpdateBill } from '@/module/purchases/presentation/components/bills/useUpdateBill';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { AmountSummary } from '@/module/purchases/presentation/components/shared/AmountSummary';
import { FormActions } from '@/module/purchases/presentation/components/shared/FormActions';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { todayIso } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useCreateBill } from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import {
  useBill,
  useOrder,
  usePaymentTermOptions,
  useTaxOptions,
} from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const orderDetail = (id: string) => routes.purchases.orderDetail.replace(':id', id);
const billDetail = (id: string) => routes.purchases.billDetail.replace(':id', id);
const CUSTOM_TERM = 'custom';

interface TermOption {
  id: string;
  name: string;
  days: number;
}

/** "Custom" has no fixed length, so it never fills the due date. */
const termDays = (terms: TermOption[], termId: string): number | null => {
  const term = terms.find((candidate) => candidate.id === termId);
  return term && term.name.trim().toLowerCase() !== CUSTOM_TERM ? term.days : null;
};

interface FormBodyProps {
  order: PurchaseOrder;
  existing?: PurchaseBill;
}

const BillFormBody = ({ order, existing }: Readonly<FormBodyProps>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const taxes = useTaxOptions();
  const termsQuery = usePaymentTermOptions();
  const terms: TermOption[] = useMemo(() => termsQuery.data ?? [], [termsQuery.data]);

  const lines = useMemo(() => {
    if (!existing) return billableLines(order);
    // A draft keeps its own lines; its quantity counts as still open while it is edited.
    const own = Object.fromEntries(
      existing.items.map((item) => [item.purchaseOrderItemId, item.quantity])
    );
    return billableLines(order, own).filter((line) => line.itemId in own);
  }, [order, existing]);

  const orderTerm = terms.find((term) => term.name === order.paymentTermName);
  const [values, setValues] = useState<BillFormValues>(() => {
    if (existing) return billToForm(existing, '');
    const days = orderTerm ? termDays(terms, orderTerm.id) : order.vendor.paymentTermDays;
    return defaultBillForm(order, lines, todayIso(), days, orderTerm?.id ?? '');
  });
  const [dueTouched, setDueTouched] = useState(Boolean(existing));
  const [showErrors, setShowErrors] = useState(false);
  const create = useCreateBill((doc) => navigate(billDetail(doc.id)));
  const update = useUpdateBill((doc) => navigate(billDetail(doc.id)));
  const pending = create.isPending || update.isPending;

  const errors = validateBill(values, lines);
  const customized = isCustomized(values, lines);
  const estimate = useMemo(
    () => estimateBill(order, lines, values, taxes.data ?? []),
    [order, lines, values, taxes.data]
  );
  const notices = detectVariances(values, lines, estimate);

  const patch = (next: Partial<BillFormValues>) =>
    setValues((current) => ({ ...current, ...next }));
  const patchLine = (itemId: string, change: Partial<BillLineValues>) =>
    setValues((current) => ({
      ...current,
      lines: { ...current.lines, [itemId]: { ...current.lines[itemId], ...change } },
    }));
  const currentDays = values.paymentTermId
    ? termDays(terms, values.paymentTermId)
    : order.vendor.paymentTermDays;

  const changeDate = (date: string) =>
    patch({ date, ...(dueTouched ? {} : { dueDate: dueDateFor(date, currentDays) }) });
  const changeTerm = (termId: string) => {
    const days = termId ? termDays(terms, termId) : order.vendor.paymentTermDays;
    setDueTouched(false);
    patch({ paymentTermId: termId, dueDate: dueDateFor(values.date, days) });
  };
  const resetLines = () =>
    setValues((current) => ({
      ...current,
      lines: defaultBillForm(order, lines, current.date, null, '').lines,
    }));

  const submit = () => {
    if (hasBillErrors(errors)) {
      setShowErrors(true);
      return;
    }
    if (existing) update.mutate({ id: existing.id, input: toBillUpdateInput(values, lines) });
    else create.mutate(toBillInput(values, lines, order.id));
  };

  return (
    <PageFrame
      icon={IconFileInvoice}
      title={
        existing
          ? t('bills.form.titleEdit', { number: existing.number })
          : t('bills.form.titleCreate')
      }
      description={t('bills.form.subtitle', { number: order.number })}
      backTo={existing ? billDetail(existing.id) : orderDetail(order.id)}
      backLabel={t('common.back')}
    >
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <SectionCard
              icon={IconClipboardText}
              title={t('bills.form.infoTitle')}
              subtitle={t('bills.form.infoSubtitle')}
            >
              <Grid gutter="md">
                <Grid.Col span={12}>
                  <Text size="xs" c="dimmed">
                    {t('bills.form.fromOrder')}
                  </Text>
                  <Anchor component={Link} to={orderDetail(order.id)} size="sm" fw={600}>
                    {order.number}
                  </Anchor>
                  <Text span size="sm" c="dimmed">
                    {' · '}
                    {order.vendor.name}
                  </Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateField
                    withAsterisk
                    label={t('bills.form.date')}
                    value={values.date}
                    onChange={changeDate}
                    error={showErrors && errors.date ? t('bills.form.dateRequired') : undefined}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    radius="md"
                    label={t('bills.form.invoiceNumber')}
                    description={t('bills.form.invoiceNumberHint')}
                    value={values.vendorInvoiceNumber}
                    maxLength={100}
                    onChange={(event) => patch({ vendorInvoiceNumber: event.currentTarget.value })}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <NumberInput
                    radius="md"
                    label={t('bills.form.invoiceTotal')}
                    description={t('bills.form.invoiceTotalHint')}
                    value={values.vendorInvoiceTotal}
                    min={0}
                    hideControls
                    allowNegative={false}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="Rp "
                    error={
                      showErrors && errors.invalidInvoiceTotal
                        ? t('bills.form.invoiceTotalInvalid')
                        : undefined
                    }
                    onChange={(value) => patch({ vendorInvoiceTotal: toNumber(value) })}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    radius="md"
                    clearable
                    label={t('bills.form.paymentTerm')}
                    placeholder={t('bills.form.paymentTermPlaceholder')}
                    data={terms.map((term) => ({ value: term.id, label: term.name }))}
                    value={values.paymentTermId || null}
                    onChange={(value) => changeTerm(value ?? '')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateField
                    clearable
                    label={t('bills.form.dueDate')}
                    description={
                      currentDays !== null
                        ? t('bills.form.dueHintTerm', { days: currentDays })
                        : t('bills.form.dueHintNone')
                    }
                    value={values.dueDate}
                    minDate={values.date || undefined}
                    onChange={(value) => {
                      setDueTouched(true);
                      patch({ dueDate: value });
                    }}
                    error={showErrors && errors.dueDate ? t('bills.form.dueBeforeDate') : undefined}
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

            <SectionCard
              icon={IconListDetails}
              title={t('bills.form.linesTitle')}
              subtitle={t('bills.form.linesSubtitle')}
            >
              <BillLinesEditor
                lines={lines}
                values={values.lines}
                taxes={taxes.data ?? []}
                invalidIds={errors.invalidLineIds}
                showErrors={showErrors}
                customized={customized}
                onChange={patchLine}
                onReset={resetLines}
              />
              {showErrors && errors.noQuantity && (
                <Text size="sm" c="red" role="alert">
                  {t('bills.form.noQuantity')}
                </Text>
              )}
            </SectionCard>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }} pos="sticky" top={20}>
          <Stack gap="lg">
            <SectionCard icon={IconCalculator} title={t('bills.form.summaryTitle')}>
              <AmountSummary {...estimate} estimate />
              <BillVarianceNotice notices={notices} />
              <FormActions
                loading={pending}
                submitLabel={existing ? t('common.save') : t('common.saveDraft')}
                onSubmit={submit}
                onCancel={() =>
                  navigate(existing ? billDetail(existing.id) : orderDetail(order.id))
                }
              />
            </SectionCard>
          </Stack>
        </Grid.Col>
      </Grid>
    </PageFrame>
  );
};

export default function BillFormPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { t } = useTranslation('purchases');
  const { can, isLoading: accessLoading } = usePurchaseAccess();
  const bill = useBill(id);
  const orderId = id ? bill.data?.purchaseOrderId : (params.get('order') ?? undefined);
  const order = useOrder(orderId);
  // The form waits for the term list so the default due date can use it.
  const terms = usePaymentTermOptions();
  const back = routes.purchases.bills;

  if (accessLoading || terms.isLoading || (id && bill.isLoading) || (orderId && order.isLoading)) {
    return <StateFrame kind="loading" />;
  }
  if (!can(PURCHASE_MENU.documents, id ? 'update' : 'create')) {
    return <StateFrame kind="noAccess" backTo={back} />;
  }
  if (!id && !orderId) {
    return (
      <StateFrame
        kind="blocked"
        title={t('bills.form.noOrderTitle')}
        description={t('bills.form.noOrderDescription')}
        backTo={routes.purchases.orders}
      />
    );
  }
  const failed = bill.error ?? order.error;
  if (failed) {
    return failed.kind === 'notFound' ? (
      <StateFrame kind="notFound" backTo={back} />
    ) : (
      <StateFrame
        kind="error"
        backTo={back}
        onRetry={() => {
          if (bill.isError) bill.refetch();
          else order.refetch();
        }}
      />
    );
  }
  if (!order.data || (id && !bill.data)) {
    return <StateFrame kind="loading" />;
  }

  if (bill.data) {
    if (!billActions(bill.data).edit) {
      return (
        <StateFrame
          kind="blocked"
          title={t('bills.form.notEditableTitle')}
          description={t('bills.form.notEditableDescription')}
          backTo={billDetail(bill.data.id)}
        />
      );
    }
    return <BillFormBody key={bill.data.id} order={order.data} existing={bill.data} />;
  }

  if (billableLines(order.data).length === 0) {
    return (
      <StateFrame
        kind="blocked"
        title={t('bills.form.nothingToBillTitle')}
        description={t('bills.form.nothingToBillDescription')}
        backTo={orderDetail(order.data.id)}
      />
    );
  }
  return <BillFormBody key={order.data.id} order={order.data} />;
}
