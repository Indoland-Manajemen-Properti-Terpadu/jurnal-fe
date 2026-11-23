import { useEffect, useState } from 'react';
import { Button, Select, Stack, Textarea } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import type { NamedRef } from '@/module/purchases/domain/purchaseCommon';
import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import {
  draftToInput,
  hasDraftErrors,
  orderToDraft,
  validateDraft,
  DRAFT_LIMITS,
  type DraftValues,
} from '@/module/purchases/domain/orderDraft';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { useUpdateOrder } from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { useWarehouseOptions } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface OrderDraftModalProps {
  order: PurchaseOrder;
  opened: boolean;
  onClose: () => void;
}

/** What can still change on a draft order: dates, the warehouse, the delivery address and the note. */
export const OrderDraftModal = ({ order, opened, onClose }: Readonly<OrderDraftModalProps>) => {
  const { t } = useTranslation('purchases');
  const update = useUpdateOrder();
  const warehouses = useWarehouseOptions();
  const [values, setValues] = useState<DraftValues>(() => orderToDraft(order));
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!opened) return;
    setValues(orderToDraft(order));
    setShowErrors(false);
  }, [opened, order]);

  const errors = validateDraft(values);
  const set = <K extends keyof DraftValues>(key: K, value: DraftValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));
  const options: NamedRef[] = [...(warehouses.data ?? [])];
  if (order.warehouse && !options.some((warehouse) => warehouse.id === order.warehouse?.id)) {
    options.unshift(order.warehouse);
  }

  const submit = () => {
    if (hasDraftErrors(errors)) {
      setShowErrors(true);
      return;
    }
    update.mutate({ id: order.id, input: draftToInput(values) }, { onSuccess: onClose });
  };

  return (
    <ModalFrame
      opened={opened}
      onClose={onClose}
      title={t('orders.draft.title', { label: order.documentLabel })}
      description={t('orders.draft.description')}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={update.isPending}>
            {t('common.cancel')}
          </Button>
          <Button loading={update.isPending} onClick={submit}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <Stack gap="md">
        <DateField
          withAsterisk
          label={t('orders.form.date')}
          value={values.transactionDate}
          onChange={(value) => set('transactionDate', value)}
          error={
            showErrors && errors.transactionDate ? t('orders.draft.error.dateRequired') : undefined
          }
        />
        <DateField
          clearable
          label={t('orders.form.expectedDate')}
          value={values.expectedDate}
          minDate={values.transactionDate || undefined}
          onChange={(value) => set('expectedDate', value)}
          error={
            showErrors && errors.expectedDate
              ? t('orders.draft.error.expectedBeforeDate')
              : undefined
          }
        />
        <Select
          clearable
          searchable
          radius="md"
          label={t('orders.draft.warehouse')}
          placeholder={t('orders.draft.warehousePlaceholder')}
          nothingFoundMessage={t('orders.draft.noWarehouse')}
          data={options.map((warehouse) => ({ value: warehouse.id, label: warehouse.name }))}
          value={values.warehouseId || null}
          onChange={(value) => set('warehouseId', value ?? '')}
        />
        <Textarea
          radius="md"
          autosize
          minRows={2}
          label={t('orders.form.deliveryAddress')}
          value={values.deliveryAddress}
          onChange={(event) => set('deliveryAddress', event.currentTarget.value)}
          error={
            showErrors && errors.deliveryAddress
              ? t('orders.draft.error.addressTooLong', { max: DRAFT_LIMITS.address })
              : undefined
          }
        />
        <Textarea
          radius="md"
          autosize
          minRows={2}
          label={t('common.memo')}
          value={values.memo}
          onChange={(event) => set('memo', event.currentTarget.value)}
          error={
            showErrors && errors.memo
              ? t('orders.draft.error.memoTooLong', { max: DRAFT_LIMITS.memo })
              : undefined
          }
        />
      </Stack>
    </ModalFrame>
  );
};
