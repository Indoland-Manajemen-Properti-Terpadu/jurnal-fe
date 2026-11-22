import { useState } from 'react';
import {
  Anchor,
  Grid,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { IconClipboardText, IconListDetails, IconReceiptRefund } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type {
  PurchaseBill,
  PurchaseReturn,
  ReturnSettlement,
} from '@/module/purchases/domain/purchaseDocuments';
import {
  hasReturnErrors,
  previewReturn,
  returnLines,
  splitReturn,
  toReturnInput,
  toReturnUpdateInput,
  validateReturn,
  type ReturnFormValues,
} from '@/module/purchases/domain/returnForm';
import { ReturnLinesEditor } from '@/module/purchases/presentation/components/returns/ReturnLinesEditor';
import { ReturnPreviewCard } from '@/module/purchases/presentation/components/returns/ReturnPreviewCard';
import { useUpdatePurchaseReturn } from '@/module/purchases/presentation/components/returns/useUpdatePurchaseReturn';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { useCreateReturn } from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { useWarehouseOptions } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { useFrozenWarehouses } from '@/module/inventory';
import { routes } from '@/router/routes';

const returnDetail = (id: string) => routes.purchases.returnDetail.replace(':id', id);
const billDetail = (id: string) => routes.purchases.billDetail.replace(':id', id);

interface ReturnFormBodyProps {
  bill: PurchaseBill;
  initial: ReturnFormValues;
  /** The draft being changed; absent when creating. */
  editing?: PurchaseReturn;
}

export const ReturnFormBody = ({ bill, initial, editing }: Readonly<ReturnFormBodyProps>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const [values, setValues] = useState<ReturnFormValues>(initial);
  const [showErrors, setShowErrors] = useState(false);
  const create = useCreateReturn((doc) => navigate(returnDetail(doc.id)));
  const update = useUpdatePurchaseReturn((doc) => navigate(returnDetail(doc.id)));

  const lines = returnLines(bill);
  const errors = validateReturn(values, bill, lines);
  const preview = previewReturn(bill, values.quantities);
  const split = splitReturn(
    preview.finalAmount,
    bill.status === 'PAID' ? 0 : bill.remainingAmount,
    values.settlement
  );
  const canDeduct = bill.status !== 'PAID' && bill.remainingAmount > 0;
  const hasStock = bill.items.some((item) => item.product?.isInventory);
  const { data: warehouses = [] } = useWarehouseOptions();
  const frozen = useFrozenWarehouses();
  const { t: tf } = useTranslation('stockTake');
  const patch = (next: Partial<ReturnFormValues>) =>
    setValues((current) => ({ ...current, ...next }));
  const back = editing ? returnDetail(editing.id) : billDetail(bill.id);

  const submit = () => {
    if (hasReturnErrors(errors)) {
      setShowErrors(true);
      return;
    }
    if (editing) update.mutate({ id: editing.id, input: toReturnUpdateInput(values) });
    else create.mutate(toReturnInput(values, bill.id));
  };

  let dateError: string | undefined;
  if (showErrors && errors.date) {
    dateError = t(
      errors.date === 'required' ? 'returns.form.dateRequired' : 'returns.form.dateBeforeBill'
    );
  }

  return (
    <PageFrame
      icon={IconReceiptRefund}
      title={
        editing
          ? t('returns.form.titleEdit', { number: editing.number })
          : t('returns.form.titleCreate')
      }
      description={t('returns.form.subtitle')}
      backTo={back}
      backLabel={t('common.back')}
    >
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 9 }}>
          <Stack gap="lg">
            <SectionCard
              icon={IconClipboardText}
              title={t('returns.form.infoTitle')}
              subtitle={t('returns.form.infoSubtitle')}
            >
              <Grid gutter="md">
                <Grid.Col span={12}>
                  <Text size="xs" c="dimmed">
                    {t('returns.form.fromBill')}
                  </Text>
                  <Anchor component={Link} to={billDetail(bill.id)} size="sm" fw={600}>
                    {bill.number}
                  </Anchor>
                  <Text span size="sm" c="dimmed">
                    {' · '}
                    {bill.vendor.name}
                  </Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateField
                    withAsterisk
                    label={t('returns.form.date')}
                    value={values.date}
                    minDate={bill.date}
                    onChange={(value) => patch({ date: value })}
                    error={dateError}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    radius="md"
                    withAsterisk
                    label={t('returns.form.reason')}
                    placeholder={t('returns.form.reasonPlaceholder')}
                    value={values.reason}
                    maxLength={300}
                    error={showErrors && errors.reason ? t('returns.form.reasonError') : undefined}
                    onChange={(event) => patch({ reason: event.currentTarget.value })}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Text size="sm" fw={500} mb={4}>
                    {t('returns.form.settlementTitle')}
                  </Text>
                  <SegmentedControl
                    fullWidth
                    radius="md"
                    value={values.settlement}
                    onChange={(value) => patch({ settlement: value as ReturnSettlement })}
                    data={(['DEDUCT', 'CREDIT', 'REFUND'] as const).map((kind) => ({
                      value: kind,
                      label: t(`returns.form.settlement.${kind}`),
                      disabled: kind === 'DEDUCT' && !canDeduct,
                    }))}
                  />
                  <Text size="xs" c="dimmed" mt={4}>
                    {!canDeduct && values.settlement !== 'DEDUCT'
                      ? t('returns.form.settlementNoBalance')
                      : t(`returns.form.settlementHint.${values.settlement}`)}
                  </Text>
                </Grid.Col>
                {hasStock && warehouses.length > 0 && (
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      radius="md"
                      searchable
                      clearable
                      label={t('returns.form.warehouse')}
                      placeholder={t('returns.form.warehousePlaceholder')}
                      description={t('returns.form.warehouseHint')}
                      data={warehouses.map((item) => {
                        const holder = frozen.get(item.id);
                        return {
                          value: item.id,
                          label: holder
                            ? `${item.name} (${tf('frozen.warehouse', { number: holder.number })})`
                            : item.name,
                          disabled: holder !== undefined,
                        };
                      })}
                      value={values.warehouseId || null}
                      onChange={(id) => patch({ warehouseId: id ?? '' })}
                    />
                  </Grid.Col>
                )}
                <Grid.Col span={12}>
                  <Textarea
                    radius="md"
                    label={t('returns.form.memo')}
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
              title={t('returns.form.linesTitle')}
              subtitle={t('returns.form.linesSubtitle')}
            >
              <ReturnLinesEditor
                lines={lines}
                quantities={values.quantities}
                overIds={errors.overIds}
                showErrors={showErrors}
                onChange={(itemId, quantity) =>
                  patch({ quantities: { ...values.quantities, [itemId]: quantity } })
                }
                onReturnAll={() =>
                  patch({
                    quantities: Object.fromEntries(
                      lines
                        .filter((line) => line.returnable > 0)
                        .map((line) => [line.itemId, line.returnable])
                    ),
                  })
                }
              />
              {showErrors && errors.noQuantity && (
                <Text size="sm" c="red" role="alert">
                  {t('returns.form.noQuantity')}
                </Text>
              )}
            </SectionCard>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 3 }} pos="sticky" top={20}>
          <ReturnPreviewCard
            preview={preview}
            appliedToBill={split.appliedToBill}
            credit={split.credit}
            settlement={values.settlement}
            submitLabel={editing ? t('returns.form.submitEdit') : t('returns.form.submit')}
            loading={create.isPending || update.isPending}
            blockedReason={
              showErrors && hasReturnErrors(errors) ? t('returns.form.fixErrors') : null
            }
            onSubmit={submit}
            onCancel={() => navigate(back)}
          />
        </Grid.Col>
      </Grid>
    </PageFrame>
  );
};
