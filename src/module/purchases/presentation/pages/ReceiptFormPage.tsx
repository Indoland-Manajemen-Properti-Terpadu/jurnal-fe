import { useState } from 'react';
import { Anchor, Grid, Stack, Text, TextInput, Textarea } from '@mantine/core';
import {
  IconClipboardText,
  IconListDetails,
  IconPackageImport,
  IconSum,
} from '@tabler/icons-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import {
  canReceive,
  emptyReceiptForm,
  hasReceiptErrors,
  receiptLines,
  receiveAllRemaining,
  toReceiptInput,
  validateReceipt,
  type ReceiptFormValues,
} from '@/module/purchases/domain/receiptForm';
import { ReceiptImpactHint } from '@/module/purchases/presentation/components/receipts/ReceiptImpactHint';
import { ReceiptLinesEditor } from '@/module/purchases/presentation/components/receipts/ReceiptLinesEditor';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { FormActions } from '@/module/purchases/presentation/components/shared/FormActions';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { todayIso } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useCreateReceipt } from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { useOrder } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const orderDetail = (id: string) => routes.purchases.orderDetail.replace(':id', id);
const receiptDetail = (id: string) => routes.purchases.receiptDetail.replace(':id', id);

const ReceiptFormBody = ({ order }: Readonly<{ order: PurchaseOrder }>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const lines = receiptLines(order);
  const [values, setValues] = useState<ReceiptFormValues>(() =>
    emptyReceiptForm(order, todayIso())
  );
  const [showErrors, setShowErrors] = useState(false);
  const create = useCreateReceipt((doc) => navigate(receiptDetail(doc.id)));

  const errors = validateReceipt(values, order, lines);
  const patch = (next: Partial<ReceiptFormValues>) =>
    setValues((current) => ({ ...current, ...next }));
  const receivedLines = lines.filter((line) => (values.quantities[line.itemId] ?? 0) > 0).length;

  const submit = () => {
    if (hasReceiptErrors(errors)) {
      setShowErrors(true);
      return;
    }
    create.mutate(toReceiptInput(values, order.id));
  };

  return (
    <PageFrame
      icon={IconPackageImport}
      title={t('receipts.form.titleCreate')}
      description={t('receipts.form.subtitle', { number: order.number })}
      backTo={orderDetail(order.id)}
      backLabel={t('common.back')}
    >
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <SectionCard
              icon={IconClipboardText}
              title={t('receipts.form.infoTitle')}
              subtitle={t('receipts.form.infoSubtitle')}
            >
              <Grid gutter="md">
                <Grid.Col span={12}>
                  <Text size="xs" c="dimmed">
                    {t('receipts.form.fromOrder')}
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
                    label={t('common.date')}
                    value={values.date}
                    minDate={order.date}
                    onChange={(value) => patch({ date: value })}
                    error={
                      showErrors && errors.date
                        ? t(
                            errors.date === 'required'
                              ? 'receipts.form.dateRequired'
                              : 'receipts.form.dateBeforeOrder'
                          )
                        : undefined
                    }
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    radius="md"
                    label={t('receipts.form.deliveryNote')}
                    placeholder={t('receipts.form.deliveryNotePlaceholder')}
                    value={values.deliveryNote}
                    maxLength={100}
                    onChange={(event) => patch({ deliveryNote: event.currentTarget.value })}
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
              title={t('receipts.form.linesTitle')}
              subtitle={t('receipts.form.linesSubtitle')}
            >
              <ReceiptLinesEditor
                lines={lines}
                quantities={values.quantities}
                overIds={errors.overIds}
                showErrors={showErrors}
                onChange={(itemId, quantity) =>
                  patch({ quantities: { ...values.quantities, [itemId]: quantity } })
                }
                onReceiveAll={() => setValues(receiveAllRemaining(values, lines))}
              />
              {showErrors && errors.noQuantity && (
                <Text size="sm" c="red" role="alert">
                  {t('receipts.form.noQuantity')}
                </Text>
              )}
            </SectionCard>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }} pos="sticky" top={20}>
          <Stack gap="lg">
            <SectionCard icon={IconSum} title={t('receipts.form.summaryTitle')}>
              <Text size="sm">
                {receivedLines > 0
                  ? t('receipts.form.summaryLines', { count: receivedLines })
                  : t('receipts.form.summaryNone')}
              </Text>
              <ReceiptImpactHint />
              <FormActions
                loading={create.isPending}
                submitLabel={t('receipts.form.submit')}
                onSubmit={submit}
                onCancel={() => navigate(orderDetail(order.id))}
              />
            </SectionCard>
          </Stack>
        </Grid.Col>
      </Grid>
    </PageFrame>
  );
};

export default function ReceiptFormPage() {
  const [params] = useSearchParams();
  const orderId = params.get('order') ?? undefined;
  const { t } = useTranslation('purchases');
  const { can, isLoading: accessLoading } = usePurchaseAccess();
  const order = useOrder(orderId);
  const back = `${routes.purchases.main}?tab=orders`;

  if (accessLoading || (orderId && order.isLoading)) {
    return <StateFrame kind="loading" />;
  }
  if (!can(PURCHASE_MENU.documents, 'create')) {
    return <StateFrame kind="noAccess" backTo={back} />;
  }
  if (!orderId) {
    return (
      <StateFrame
        kind="blocked"
        title={t('receipts.form.noOrderTitle')}
        description={t('receipts.form.noOrderDescription')}
        backTo={back}
      />
    );
  }
  if (order.isError) {
    return order.error?.kind === 'notFound' ? (
      <StateFrame kind="notFound" backTo={back} />
    ) : (
      <StateFrame
        kind="error"
        backTo={back}
        onRetry={() => {
          order.refetch();
        }}
      />
    );
  }
  if (!order.data) {
    return <StateFrame kind="loading" />;
  }
  if (!canReceive(order.data)) {
    return (
      <StateFrame
        kind="blocked"
        title={t('receipts.form.notReadyTitle')}
        description={t('receipts.form.notReadyDescription')}
        backTo={orderDetail(order.data.id)}
      />
    );
  }
  return <ReceiptFormBody key={order.data.id} order={order.data} />;
}
