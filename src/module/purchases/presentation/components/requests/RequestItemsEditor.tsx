import { ActionIcon, Button, NumberInput, Table, Text, TextInput, Tooltip } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  emptyRequestItem,
  type RequestFormErrors,
  type RequestFormItem,
} from '@/module/purchases/domain/requestForm';
import { ProductPicker } from '@/module/purchases/presentation/components/requests/ProductPicker';

interface RequestItemsEditorProps {
  items: RequestFormItem[];
  errors: RequestFormErrors;
  showErrors: boolean;
  onChange: (items: RequestFormItem[]) => void;
}

/** Lines of a request: a purchasable product, or a service typed as a description. */
export const RequestItemsEditor = ({
  items,
  errors,
  showErrors,
  onChange,
}: Readonly<RequestItemsEditorProps>) => {
  const { t } = useTranslation('purchases');
  const update = (key: string, patch: Partial<RequestFormItem>) =>
    onChange(items.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  return (
    <>
      <Table.ScrollContainer minWidth={680}>
        <Table verticalSpacing="xs" horizontalSpacing="xs">
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              {['product', 'description', 'quantity', 'unit'].map((key) => (
                <Table.Th key={key}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    {t(`requests.form.col.${key}`)}
                  </Text>
                </Table.Th>
              ))}
              <Table.Th w={44} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((item, index) => {
              const row = errors.itemRows[item.key];
              return (
                <Table.Tr key={item.key} style={{ verticalAlign: 'top' }}>
                  <Table.Td miw={220}>
                    <ProductPicker
                      aria-label={t('requests.form.productAria', { number: index + 1 })}
                      value={item.productId}
                      selectedName={item.productName}
                      onChange={(product) =>
                        update(item.key, {
                          productId: product?.id ?? '',
                          productName: product?.name ?? '',
                          unitName: product?.unitName ?? '',
                        })
                      }
                    />
                  </Table.Td>
                  <Table.Td miw={220} w="45%">
                    <TextInput
                      radius="md"
                      aria-label={t('requests.form.descriptionAria', { number: index + 1 })}
                      placeholder={
                        item.productId
                          ? t('requests.form.descriptionOptional')
                          : t('requests.form.descriptionPlaceholder')
                      }
                      value={item.description}
                      maxLength={255}
                      error={
                        showErrors && row?.description
                          ? t('requests.form.descriptionRequired')
                          : undefined
                      }
                      onChange={(event) =>
                        update(item.key, { description: event.currentTarget.value })
                      }
                    />
                  </Table.Td>
                  <Table.Td w={120}>
                    <NumberInput
                      radius="md"
                      aria-label={t('requests.form.quantityAria', { number: index + 1 })}
                      value={item.quantity}
                      min={0}
                      decimalScale={4}
                      hideControls
                      allowNegative={false}
                      error={
                        showErrors && row?.quantity
                          ? t('requests.form.quantityPositive')
                          : undefined
                      }
                      onChange={(value) =>
                        update(item.key, { quantity: value === '' ? '' : Number(value) })
                      }
                    />
                  </Table.Td>
                  <Table.Td w={110}>
                    <Text size="sm" c="dimmed" pt={7}>
                      {item.unitName || '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label={t('requests.form.removeItem')}>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        aria-label={t('requests.form.removeItemAria', { number: index + 1 })}
                        disabled={items.length === 1}
                        onClick={() => onChange(items.filter((other) => other.key !== item.key))}
                        mt={4}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {showErrors && errors.items && (
        <Text size="sm" c="red">
          {t('requests.form.itemsEmpty')}
        </Text>
      )}
      <div>
        <Button
          variant="light"
          size="sm"
          radius="md"
          leftSection={<IconPlus size={14} />}
          onClick={() => onChange([...items, emptyRequestItem()])}
        >
          {t('requests.form.addItem')}
        </Button>
      </div>
    </>
  );
};
