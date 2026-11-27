import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Group, NumberInput, Stack, Table, Text, Textarea } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import {
  buildPriceChangeInput,
  openPriceChangeItems,
  validatePriceChangeForm,
  type PriceChangeFormValues,
  type PriceChangeInput,
  type PriceChangeOrderItem,
} from '@/module/purchases/domain/purchasePriceChanges';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

interface BillPriceChangeDialogProps {
  opened: boolean;
  orderNumber: string;
  orderItems: PriceChangeOrderItem[];
  invoiceNumber: string;
  invoiceTotal: number | '';
  orderLoading: boolean;
  orderError: boolean;
  loading: boolean;
  onRetryOrder: () => void;
  onClose: () => void;
  onSubmit: (input: PriceChangeInput) => void;
}

const MONEY = {
  decimalScale: 4,
  thousandSeparator: '.',
  decimalSeparator: ',',
  hideControls: true,
} as const;

export const BillPriceChangeDialog = ({
  opened,
  orderNumber,
  orderItems,
  invoiceNumber,
  invoiceTotal,
  orderLoading,
  orderError,
  loading,
  onRetryOrder,
  onClose,
  onSubmit,
}: Readonly<BillPriceChangeDialogProps>) => {
  const { t } = useTranslation('purchases');
  const [proposedPrices, setProposedPrices] = useState<PriceChangeFormValues['proposedPrices']>({});
  const [reason, setReason] = useState('');
  const items = useMemo(() => openPriceChangeItems(orderItems), [orderItems]);
  const values: PriceChangeFormValues = {
    proposedPrices,
    reason,
    vendorInvoiceNumber: invoiceNumber,
    vendorInvoiceTotal: invoiceTotal,
  };
  const errors = validatePriceChangeForm(values, items);

  useEffect(() => {
    if (opened) {
      setProposedPrices({});
      setReason('');
    }
  }, [opened]);

  const submit = () => {
    if (Object.keys(errors).length > 0) return;
    onSubmit(buildPriceChangeInput(orderItems, values));
  };

  return (
    <ModalFrame
      opened={opened}
      onClose={onClose}
      title={t('bills.priceChange.requestTitle')}
      description={t('bills.priceChange.requestDescription')}
      size="xl"
      footer={
        <Group justify="space-between" wrap="wrap">
          <Text size="sm" c="dimmed">
            {t('bills.priceChange.requestOrder', { number: orderNumber })}
          </Text>
          <Group gap="sm">
            <Button variant="default" disabled={loading} onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              loading={loading}
              disabled={
                orderLoading || orderError || items.length === 0 || Object.keys(errors).length > 0
              }
              onClick={submit}
            >
              {t('bills.priceChange.submit')}
            </Button>
          </Group>
        </Group>
      }
    >
      <Stack gap="md">
        {orderLoading && (
          <Text size="sm" c="dimmed">
            {t('bills.priceChange.orderLoading')}
          </Text>
        )}
        {orderError && (
          <Alert color="red" title={t('bills.priceChange.orderError')}>
            <Button size="xs" variant="light" mt="xs" onClick={onRetryOrder}>
              {t('common.retry')}
            </Button>
          </Alert>
        )}
        {!orderLoading && !orderError && items.length === 0 && (
          <Alert color="yellow">{t('bills.priceChange.noOpenItems')}</Alert>
        )}
        {items.length > 0 && (
          <Table.ScrollContainer minWidth={620} type="native">
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('bills.priceChange.item')}</Table.Th>
                  <Table.Th ta="right">{t('bills.priceChange.oldPrice')}</Table.Th>
                  <Table.Th>{t('bills.priceChange.newPrice')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((item) => (
                  <Table.Tr key={item.purchaseOrderItem}>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        {item.description}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t('bills.form.openQty', { count: item.openQty })}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatAmount(item.oldUnitPrice)}
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        aria-label={`${t('bills.priceChange.newPrice')} — ${item.description}`}
                        prefix="Rp "
                        min={0}
                        allowNegative={false}
                        {...MONEY}
                        value={proposedPrices[item.purchaseOrderItem] ?? ''}
                        onChange={(value) =>
                          setProposedPrices((current) => ({
                            ...current,
                            [item.purchaseOrderItem]: value === '' ? '' : Number(value),
                          }))
                        }
                        error={
                          errors.itemPrices ? t('bills.priceChange.itemPriceInvalid') : undefined
                        }
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
        <Textarea
          label={t('bills.priceChange.reason')}
          placeholder={t('bills.priceChange.reasonPlaceholder')}
          value={reason}
          onChange={(event) => setReason(event.currentTarget.value)}
          minRows={3}
          autosize
          maxLength={2_000}
          required
          error={
            errors.reason
              ? t(
                  `bills.priceChange.reason${errors.reason === 'required' ? 'Required' : 'TooLong'}`
                )
              : undefined
          }
        />
        {errors.items && (
          <Text size="sm" c="red.7">
            {t('bills.priceChange.changedItemRequired')}
          </Text>
        )}
        {errors.vendorInvoiceTotal && (
          <Text size="sm" c="red.7">
            {t('bills.priceChange.invoiceTotalRequired')}
          </Text>
        )}
        {errors.vendorInvoiceNumber && (
          <Text size="sm" c="red.7">
            {t('bills.priceChange.invoiceNumberTooLong')}
          </Text>
        )}
      </Stack>
    </ModalFrame>
  );
};
