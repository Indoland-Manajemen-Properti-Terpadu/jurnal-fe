import {
  ActionIcon,
  Button,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { CreateSaleFormValues } from '../../domain/sale';

type Option = { value: string; label: string };

type CreateSaleItemsTabProps = {
  form: UseFormReturnType<CreateSaleFormValues>;
  productOptions: Option[];
  taxOptions: Option[];
  onProductSelect: (index: number, productId: string | null) => void;
  onAddRow: () => void;
};

const COLUMNS = [
  { key: 'colProduct', width: '32%' },
  { key: 'colQuantity', width: '15%' },
  { key: 'colUnitPrice', width: '22%' },
  { key: 'colTax', width: '20%' },
] as const;

export function CreateSaleItemsTab({
  form,
  productOptions,
  taxOptions,
  onProductSelect,
  onAddRow,
}: Readonly<CreateSaleItemsTabProps>) {
  const { t } = useTranslation('sales');

  return (
    <Stack gap="sm">
      <Table.ScrollContainer minWidth={700}>
        <Table verticalSpacing="xs">
          <Table.Thead bg="gray.0">
            <Table.Tr>
              {COLUMNS.map((column) => (
                <Table.Th key={column.key} style={{ width: column.width }}>
                  <Text size="xs" fw={700} c="dimmed">
                    {t(`create.${column.key}`)}
                  </Text>
                </Table.Th>
              ))}
              <Table.Th style={{ width: '11%' }} ta="center">
                <Text size="xs" fw={700} c="dimmed">
                  {t('create.colRemove')}
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {form.values.items.map((item, idx) => (
              <Table.Tr key={`item-${idx}`}>
                <Table.Td>
                  <Select
                    placeholder={t('create.productPlaceholder')}
                    data={productOptions}
                    searchable
                    size="xs"
                    value={item.productId}
                    onChange={(val) => onProductSelect(idx, val)}
                    error={form.errors[`items.${idx}.productId`]}
                  />
                  <TextInput
                    placeholder={t('create.linePlaceholder')}
                    size="xs"
                    mt={4}
                    {...form.getInputProps(`items.${idx}.description`)}
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput size="xs" min={1} {...form.getInputProps(`items.${idx}.quantity`)} />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    size="xs"
                    thousandSeparator="."
                    decimalSeparator=","
                    min={0}
                    {...form.getInputProps(`items.${idx}.unitPrice`)}
                  />
                </Table.Td>
                <Table.Td>
                  <Select
                    placeholder={t('create.taxPlaceholder')}
                    data={taxOptions}
                    clearable
                    size="xs"
                    {...form.getInputProps(`items.${idx}.taxId`)}
                  />
                </Table.Td>
                <Table.Td ta="center">
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    size="sm"
                    disabled={form.values.items.length === 1}
                    onClick={() => form.removeListItem('items', idx)}
                  >
                    <IconTrash size={15} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Button
        variant="light"
        color="primary"
        size="xs"
        leftSection={<IconPlus size={14} />}
        onClick={onAddRow}
        style={{ alignSelf: 'flex-start' }}
      >
        {t('create.addRow')}
      </Button>
    </Stack>
  );
}
