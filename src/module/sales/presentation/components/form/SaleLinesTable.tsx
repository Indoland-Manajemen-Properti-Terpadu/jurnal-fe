import { ActionIcon, NumberInput, Select, Table, Text, TextInput } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatIDR } from '@/module/sales/domain/saleFormat';
import { lineAmount } from '@/module/sales/domain/saleTotals';
import type { SaleFormApi } from '../../hooks/useSaleForm';

const money = { thousandSeparator: '.', decimalSeparator: ',', hideControls: true } as const;

export function SaleLinesTable({ api }: Readonly<{ api: SaleFormApi }>) {
  const { t } = useTranslation('sales');
  const { form } = api;
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
          {form.values.items.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Table.Tr key={index}>
              <Table.Td miw={260}>
                <Select
                  aria-label={t('form.lines.colProduct')}
                  placeholder={t('form.lines.productPlaceholder')}
                  data={api.productOptions}
                  searchable
                  value={item.productId}
                  onChange={(value) => api.changeProduct(index, value)}
                  error={form.errors[`items.${index}.productId`]}
                />
                <TextInput
                  mt={4}
                  size="xs"
                  aria-label={t('form.lines.linePlaceholder')}
                  placeholder={t('form.lines.linePlaceholder')}
                  {...form.getInputProps(`items.${index}.description`)}
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
                  decimalScale={4}
                  {...money}
                  {...form.getInputProps(`items.${index}.quantity`)}
                />
              </Table.Td>
              <Table.Td w={150}>
                <NumberInput
                  aria-label={t('form.lines.colUnitPrice')}
                  min={0}
                  decimalScale={2}
                  {...money}
                  {...form.getInputProps(`items.${index}.unitPrice`)}
                />
              </Table.Td>
              <Table.Td w={170}>
                <Select
                  aria-label={t('form.lines.colTax')}
                  placeholder={t('form.lines.taxPlaceholder')}
                  data={api.taxOptions}
                  clearable
                  value={item.taxId || null}
                  onChange={(value) => form.setFieldValue(`items.${index}.taxId`, value || '')}
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
                  onClick={() => api.removeLine(index)}
                  disabled={form.values.items.length === 1}
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
