import { ActionIcon, NumberInput, Select, Table, Text, TextInput } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatIDR } from '@/module/sales/domain/saleFormat';
import { lineAmount } from '@/module/sales/domain/saleTotals';
import type { CreateSaleItemForm } from '@/module/sales/domain/sale';

const money = {
  thousandSeparator: '.',
  decimalSeparator: ',',
  hideControls: true,
  allowLeadingZeros: false,
  allowNegative: false,
} as const;

/** A cleared field counts as 0 but stays empty on screen, so typing never lands after a "0". */
const toAmount = (value: number | string): number => (typeof value === 'number' ? value : 0);

type Option = { value: string; label: string };

interface SaleLinesTableProps {
  items: CreateSaleItemForm[];
  /** Messages by field path (`items.0.quantity`), already translated. */
  errors: Record<string, React.ReactNode>;
  productOptions: Option[];
  taxOptions: Option[];
  /** Picking a product also fills the price, unit, description and tax, so it is its own handler. */
  onProductChange: (index: number, productId: string | null) => void;
  onChange: (index: number, patch: Partial<CreateSaleItemForm>) => void;
  onRemove: (index: number) => void;
}

/** The lines of an invoice, quote or order; the caller owns the form state. */
export function SaleLinesTable({
  items,
  errors,
  productOptions,
  taxOptions,
  onProductChange,
  onChange,
  onRemove,
}: Readonly<SaleLinesTableProps>) {
  const { t } = useTranslation('sales');
  const head = (key: string, align?: 'right') => (
    <Table.Th ta={align}>
      <Text size="xs" fw={700} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
        {t(`form.lines.${key}`)}
      </Text>
    </Table.Th>
  );

  return (
    <Table.ScrollContainer minWidth={900}>
      <Table verticalSpacing="xs" horizontalSpacing="xs">
        <Table.Thead bg="gray.0">
          <Table.Tr>
            {head('colProduct')}
            {head('colUnit')}
            {head('colQuantity', 'right')}
            {head('colUnitPrice', 'right')}
            {head('colTax')}
            {head('colAmount', 'right')}
            <Table.Th w={44} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Table.Tr key={index}>
              <Table.Td miw={260}>
                <Select
                  aria-label={t('form.lines.colProduct')}
                  placeholder={t('form.lines.productPlaceholder')}
                  data={productOptions}
                  searchable
                  value={item.productId}
                  onChange={(value) => onProductChange(index, value)}
                  error={errors[`items.${index}.productId`]}
                />
                <TextInput
                  mt={4}
                  size="xs"
                  aria-label={t('form.lines.linePlaceholder')}
                  placeholder={t('form.lines.linePlaceholder')}
                  value={item.description}
                  onChange={(event) => onChange(index, { description: event.currentTarget.value })}
                />
              </Table.Td>
              <Table.Td w={110}>
                <TextInput
                  aria-label={t('form.lines.colUnit')}
                  title={t('form.lines.unitHint')}
                  value={item.unit || t('form.lines.unitEmpty')}
                  disabled
                />
              </Table.Td>
              <Table.Td w={100}>
                <NumberInput
                  aria-label={t('form.lines.colQuantity')}
                  min={0}
                  max={item.maxQuantity}
                  decimalScale={4}
                  {...money}
                  placeholder="0"
                  description={
                    item.maxQuantity === undefined
                      ? undefined
                      : t('form.lines.orderLeft', { count: item.maxQuantity })
                  }
                  value={item.quantity || ''}
                  onChange={(value) => onChange(index, { quantity: toAmount(value) })}
                  error={errors[`items.${index}.quantity`]}
                />
              </Table.Td>
              <Table.Td w={150}>
                <NumberInput
                  aria-label={t('form.lines.colUnitPrice')}
                  min={0}
                  decimalScale={2}
                  {...money}
                  placeholder="0"
                  value={item.unitPrice || ''}
                  onChange={(value) => onChange(index, { unitPrice: toAmount(value) })}
                  error={errors[`items.${index}.unitPrice`]}
                />
              </Table.Td>
              <Table.Td w={170}>
                <Select
                  aria-label={t('form.lines.colTax')}
                  placeholder={t('form.lines.taxPlaceholder')}
                  data={taxOptions}
                  clearable
                  value={item.taxId || null}
                  onChange={(value) => onChange(index, { taxId: value || '' })}
                />
              </Table.Td>
              <Table.Td ta="right" w={140}>
                <Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatIDR(lineAmount(item.quantity, item.unitPrice))}
                </Text>
              </Table.Td>
              <Table.Td>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => onRemove(index)}
                  disabled={items.length === 1}
                  aria-label={t('form.lines.removeRow', { number: index + 1 })}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
