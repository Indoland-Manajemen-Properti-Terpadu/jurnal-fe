import { useMemo, useState } from 'react';
import { Anchor, Badge, Grid, Select, Stack, Text, TextInput, Textarea } from '@mantine/core';
import {
  IconCalculator,
  IconClipboardText,
  IconListDetails,
  IconPercentage,
  IconShoppingCart,
} from '@tabler/icons-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import {
  canBecomeOrder,
  hasOrderErrors,
  orderFromRequest,
  orderToForm,
  orderTotalsInput,
  selectedQuotation,
  toOrderInput,
  toOrderUpdateInput,
  validateOrderForm,
  type OrderFormValues,
} from '@/module/purchases/domain/orderForm';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { orderActions } from '@/module/purchases/domain/purchaseActions';
import type { PurchaseOrder, PurchaseRequest } from '@/module/purchases/domain/purchaseDocuments';
import { calculateTotals } from '@/module/purchases/domain/purchaseTotals';
import { OrderItemsEditor } from '@/module/purchases/presentation/components/orders/OrderItemsEditor';
import { OrderPricingSection } from '@/module/purchases/presentation/components/orders/OrderPricingSection';
import { useUpdateOrder } from '@/module/purchases/presentation/components/orders/useUpdateOrder';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { AmountSummary } from '@/module/purchases/presentation/components/shared/AmountSummary';
import { SupplierSelect } from '@/module/purchases/presentation/components/shared/LookupSelects';
import { FormActions } from '@/module/purchases/presentation/components/shared/FormActions';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { todayIso } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useCreateOrder } from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import {
  useOrder,
  usePaymentTermOptions,
  useRequest,
  useTaxOptions,
} from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const orderDetail = (id: string) => routes.purchases.orderDetail.replace(':id', id);
const requestDetail = (id: string) => routes.purchases.requestDetail.replace(':id', id);

interface FormBodyProps {
  request: PurchaseRequest;
  existing?: PurchaseOrder;
}

const OrderFormBody = ({ request, existing }: Readonly<FormBodyProps>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const taxes = useTaxOptions();
  const terms = usePaymentTermOptions();
  const vendorFromQuotation = request.mode === 'WITH_QUOTATION';
  const quotation = selectedQuotation(request);

  const [values, setValues] = useState<OrderFormValues>(() => {
    if (!existing) {
      return orderFromRequest(request, todayIso());
    }
    const form = orderToForm(existing);
    const term = terms.data?.find((candidate) => candidate.name === existing.paymentTermName);
    return { ...form, paymentTermId: term?.id ?? '' };
  });
  const [showErrors, setShowErrors] = useState(false);
  const create = useCreateOrder((doc) => navigate(orderDetail(doc.id)));
  const update = useUpdateOrder((doc) => navigate(orderDetail(doc.id)));
  const pending = create.isPending || update.isPending;

  const errors = validateOrderForm(values, { vendorFromQuotation });
  const totals = useMemo(
    () => calculateTotals(orderTotalsInput(values, taxes.data ?? [])),
    [values, taxes.data]
  );
  const patch = (next: Partial<OrderFormValues>) =>
    setValues((current) => ({ ...current, ...next }));
  const vendorName = existing?.vendor.name ?? quotation?.vendor.name ?? '-';

  const submit = () => {
    if (hasOrderErrors(errors)) {
      setShowErrors(true);
      return;
    }
    if (existing) {
      update.mutate({ id: existing.id, input: toOrderUpdateInput(values, vendorFromQuotation) });
    } else create.mutate(toOrderInput(values, request.id, vendorFromQuotation));
  };

  return (
    <PageFrame
      icon={IconShoppingCart}
      title={
        existing
          ? t('orders.form.titleEdit', { number: existing.number })
          : t('orders.form.titleCreate')
      }
      description={t('orders.form.subtitle', { number: request.number })}
      backTo={existing ? orderDetail(existing.id) : requestDetail(request.id)}
      backLabel={t('common.back')}
    >
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <SectionCard
              icon={IconClipboardText}
              title={t('orders.form.infoTitle')}
              subtitle={t('orders.form.infoSubtitle')}
            >
              <Grid gutter="md">
                <Grid.Col span={12}>
                  <Text size="xs" c="dimmed">
                    {t('orders.form.fromRequest')}
                  </Text>
                  <Anchor component={Link} to={requestDetail(request.id)} size="sm" fw={600}>
                    {request.number}
                  </Anchor>
                  {request.purpose && (
                    <Text span size="sm" c="dimmed">
                      {' · '}
                      {request.purpose}
                    </Text>
                  )}
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateField
                    withAsterisk
                    label={t('orders.form.date')}
                    value={values.transactionDate}
                    onChange={(value) => patch({ transactionDate: value })}
                    error={
                      showErrors && errors.transactionDate
                        ? t('requests.form.dateRequired')
                        : undefined
                    }
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateField
                    label={t('orders.form.expectedDate')}
                    value={values.expectedDate}
                    clearable
                    minDate={values.transactionDate || undefined}
                    onChange={(value) => patch({ expectedDate: value })}
                    error={
                      showErrors && errors.expectedDate
                        ? t('requests.form.requiredBeforeDate')
                        : undefined
                    }
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  {vendorFromQuotation ? (
                    <TextInput
                      radius="md"
                      label={t('common.vendor')}
                      value={vendorName}
                      readOnly
                      aria-describedby="vendor-from-quotation"
                    />
                  ) : (
                    <SupplierSelect
                      withAsterisk
                      label={t('common.vendor')}
                      value={values.vendorId || null}
                      selected={existing?.vendor ?? null}
                      onChange={(id) => patch({ vendorId: id ?? '' })}
                      error={
                        showErrors && errors.vendor ? t('orders.form.vendorRequired') : undefined
                      }
                    />
                  )}
                  {vendorFromQuotation && (
                    <Text id="vendor-from-quotation" fz="xs" c="dimmed" mt={4}>
                      {t('orders.form.vendorFromQuotation')}
                    </Text>
                  )}
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    radius="md"
                    clearable
                    label={t('orders.form.paymentTerm')}
                    placeholder={t('orders.form.paymentTermPlaceholder')}
                    data={(terms.data ?? []).map((term) => ({ value: term.id, label: term.name }))}
                    value={values.paymentTermId || null}
                    onChange={(value) => patch({ paymentTermId: value ?? '' })}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    radius="md"
                    label={t('orders.form.deliveryAddress')}
                    value={values.deliveryAddress}
                    maxLength={255}
                    onChange={(event) => patch({ deliveryAddress: event.currentTarget.value })}
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
              title={t('orders.form.itemsTitle')}
              subtitle={t('orders.form.itemsSubtitle')}
            >
              <OrderItemsEditor
                items={values.items}
                taxes={taxes.data ?? []}
                errors={errors}
                showErrors={showErrors}
                onChange={(items) => patch({ items })}
              />
            </SectionCard>

            <SectionCard
              icon={IconPercentage}
              title={t('orders.form.pricingTitle')}
              subtitle={t('orders.form.pricingSubtitle')}
            >
              <OrderPricingSection
                values={values}
                errors={errors}
                showErrors={showErrors}
                onChange={patch}
              />
            </SectionCard>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }} pos="sticky" top={20}>
          <SectionCard
            icon={IconCalculator}
            title={t('orders.form.summaryTitle')}
            action={
              <Badge variant="light" color="gray" radius="sm">
                {t('amounts.estimateBadge')}
              </Badge>
            }
          >
            <AmountSummary {...totals} estimate />
            <FormActions
              loading={pending}
              submitLabel={existing ? t('common.save') : t('common.saveDraft')}
              onSubmit={submit}
              onCancel={() =>
                navigate(existing ? orderDetail(existing.id) : requestDetail(request.id))
              }
            />
          </SectionCard>
        </Grid.Col>
      </Grid>
    </PageFrame>
  );
};

export default function OrderFormPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { can, isLoading: accessLoading } = usePurchaseAccess();
  const { t } = useTranslation('purchases');
  const order = useOrder(id);
  const requestId = id ? order.data?.purchaseRequestId : (params.get('request') ?? undefined);
  const request = useRequest(requestId);
  // An order stores only the name of its payment term, so the list must be known before editing.
  const terms = usePaymentTermOptions();

  if (
    accessLoading ||
    (id && terms.isLoading) ||
    (id && order.isLoading) ||
    (requestId && request.isLoading)
  ) {
    return <StateFrame kind="loading" />;
  }
  if (!can(PURCHASE_MENU.documents, id ? 'update' : 'create')) {
    return <StateFrame kind="noAccess" />;
  }
  if (!id && !requestId) {
    return (
      <StateFrame
        kind="blocked"
        title={t('orders.form.noRequestTitle')}
        description={t('orders.form.noRequestDescription')}
        backTo={`${routes.purchases.main}?tab=requests`}
      />
    );
  }
  const failed = order.error ?? request.error;
  if (failed) {
    return failed.kind === 'notFound' ? (
      <StateFrame kind="notFound" />
    ) : (
      <StateFrame
        kind="error"
        onRetry={() => {
          if (order.isError) {
            order.refetch();
          } else {
            request.refetch();
          }
        }}
      />
    );
  }
  if (!request.data || (id && !order.data)) {
    return <StateFrame kind="loading" />;
  }

  if (order.data) {
    if (!orderActions(order.data).edit) {
      return (
        <StateFrame
          kind="blocked"
          title={t('orders.form.notEditableTitle')}
          description={t('orders.form.notEditableDescription')}
          backTo={orderDetail(order.data.id)}
        />
      );
    }
    return <OrderFormBody key={order.data.id} request={request.data} existing={order.data} />;
  }

  if (!canBecomeOrder(request.data)) {
    return (
      <StateFrame
        kind="blocked"
        title={t('orders.form.notReadyTitle')}
        description={t('orders.form.notReadyDescription')}
        backTo={requestDetail(request.data.id)}
      />
    );
  }
  return <OrderFormBody key={request.data.id} request={request.data} />;
}
