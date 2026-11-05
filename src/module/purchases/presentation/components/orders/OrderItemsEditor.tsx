import { NumberInput, Select, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { TaxRef } from '@/module/purchases/domain/purchaseCommon';
import type { OrderFormErrors, OrderFormItem } from '@/module/purchases/domain/orderForm';
import {
  formatAmount,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';

interface OrderItemsEditorProps {
  items: OrderFormItem[];
  taxes: TaxRef[];
  errors: OrderFormErrors;
  showErrors: boolean;
  onChange: (items: OrderFormItem[]) => void;
}

/** Quantities come from the request; the order adds the price and tax of each line. */
export const OrderItemsEditor = ({
  items,
  taxes,
  errors,
  showErrors,
  onChange,
}: Readonly<OrderItemsEditorProps>) => {
  const { t } = useTranslation('purchases');
  const update = (id: string, patch: Partial<OrderFormItem>) =>
    onChange(items.map((item) => (item.requestItemId === id ? { ...item, ...patch } : item)));

  return (
    <Table.ScrollContainer minWidth={720}>
      <Table verticalSpacing="xs" horizontalSpacing="xs">
        <Table.Thead bg="var(--jurnal-color-surface-hover)">
          <Table.Tr>
            {['item', 'quantity', 'unitPrice', 'tax', 'amount'].map((key) => (
              <Table.Th key={key} ta={key === 'amount' ? 'right' : undefined}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  {t(`orders.form.col.${key}`)}
                </Text>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => (
            <Table.Tr key={item.requestItemId} style={{ verticalAlign: 'top' }}>
              <Table.Td miw={180}>
                <Text size="sm" pt={7}>
                  {item.label || '-'}
                </Text>
              </Table.Td>
              <Table.Td w={110}>
                <Text
                  size="sm"
                  c="dimmed"
                  pt={7}
                  style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatQuantity(item.quantity)} {item.unitName}
                </Text>
              </Table.Td>
              <Table.Td w={170}>
                <NumberInput
                  radius="md"
                  aria-label={t('orders.form.priceAria', { item: item.label })}
                  value={item.unitPrice}
                  min={0}
                  hideControls
                  allowNegative={false}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp "
                  error={
                    showErrors && errors.itemPrices[item.requestItemId]
                      ? t('orders.form.priceRequired')
                      : undefined
                  }
                  onChange={(value) =>
                    update(item.requestItemId, { unitPrice: value === '' ? '' : Number(value) })
                  }
                />
              </Table.Td>
              <Table.Td w={190}>
                <Select
                  radius="md"
                  clearable
                  aria-label={t('orders.form.taxAria', { item: item.label })}
                  placeholder={t('orders.form.noTax')}
                  data={taxes.map((tax) => ({
                    value: tax.id,
                    label: `${tax.name} (${tax.rate}%)`,
                  }))}
                  value={item.taxId || null}
                  onChange={(value) => update(item.requestItemId, { taxId: value ?? '' })}
                />
              </Table.Td>
              <Table.Td ta="right">
                <Text
                  size="sm"
                  pt={7}
                  style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatAmount(item.quantity * Number(item.unitPrice || 0))}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};
