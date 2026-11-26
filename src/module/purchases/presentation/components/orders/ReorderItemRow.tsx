import { Checkbox, NumberInput, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { FieldError } from '@/lib/http/apiError';
import type { OrderItem } from '@/module/purchases/domain/purchaseDocuments';
import type { ReorderPreview } from '@/module/purchases/domain/purchaseReorder';
import {
  formatAmount,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';
import type { EditableLine } from '@/module/purchases/presentation/components/orders/reorderFormState';

interface ReorderItemRowProps {
  item: OrderItem;
  line?: EditableLine;
  preview?: ReorderPreview;
  inputIndex: number;
  fieldErrors: FieldError[];
  locked: boolean;
  onChange: (id: string, update: Partial<EditableLine>) => void;
}

export const ReorderItemRow = ({
  item,
  line,
  preview,
  inputIndex,
  fieldErrors,
  locked,
  onChange,
}: Readonly<ReorderItemRowProps>) => {
  const { t } = useTranslation('purchases');
  const selected = line?.checked && line.quantity > 0;
  const itemPreview = preview?.items?.find((entry) => entry.sourceItemId === item.id);
  const lineError = (field: 'quantity' | 'unitPrice') =>
    fieldErrors.find(
      (entry) =>
        entry.field === `items[${inputIndex}].${field}` ||
        entry.field === `items.${inputIndex}.${field}`
    )?.message;
  return (
    <Table.Tr>
      <Table.Td>
        <Checkbox
          aria-label={item.product?.name || item.description}
          checked={Boolean(line?.checked)}
          disabled={item.reorderSelectable === false || locked}
          onChange={(event) => onChange(item.id, { checked: event.currentTarget.checked })}
        />
      </Table.Td>
      <Table.Td>
        <Text fw={600} size="sm">
          {item.product?.name || item.description}
        </Text>
        <Text size="xs" c="dimmed">
          {t('orders.reorder.previous', {
            qty: formatQuantity(item.quantity),
            price: formatAmount(item.unitPrice),
          })}
        </Text>
      </Table.Td>
      <Table.Td>
        <NumberInput
          aria-label={t('orders.reorder.qty')}
          value={line?.quantity ?? item.quantity}
          error={lineError('quantity')}
          min={0}
          decimalScale={4}
          disabled={!line?.checked || locked}
          onChange={(value) => onChange(item.id, { quantity: Number(value) || 0 })}
        />
        <Text size="xs" c="dimmed">
          {item.unitName}
        </Text>
      </Table.Td>
      <Table.Td>
        <NumberInput
          aria-label={t('orders.reorder.price')}
          value={line?.unitPrice ?? item.unitPrice}
          error={lineError('unitPrice')}
          min={0}
          decimalScale={2}
          disabled={!line?.checked || locked}
          onChange={(value) => onChange(item.id, { unitPrice: Number(value) || 0 })}
        />
        {selected && line && line.unitPrice > item.unitPrice && (
          <Text size="xs" c="orange.8">
            {t('orders.reorder.increasedBy', {
              amount: formatAmount(line.unitPrice - item.unitPrice),
            })}
          </Text>
        )}
      </Table.Td>
      <Table.Td ta="right">
        <Text fw={600}>
          {selected ? formatAmount(itemPreview?.amount ?? 0, preview?.precision) : '—'}
        </Text>
      </Table.Td>
    </Table.Tr>
  );
};
