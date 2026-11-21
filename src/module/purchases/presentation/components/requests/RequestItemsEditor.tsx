import {
  ActionIcon,
  Button,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  emptyRequestItem,
  MIN_QUANTITY,
  REQUEST_LIMITS,
  type RequestFormErrors,
  type RequestFormItem,
} from '@/module/purchases/domain/requestForm';
import { ProductPicker } from '@/module/purchases/presentation/components/requests/ProductPicker';
import { useUnitOptions } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface RequestItemsEditorProps {
  items: RequestFormItem[];
  errors: RequestFormErrors;
  showErrors: boolean;
  onChange: (items: RequestFormItem[]) => void;
}

const KINDS = ['GOODS', 'SERVICE'] as const;

/** Lines of a request: goods or a service, a product when it exists, a spec, a quantity and a unit. */
export const RequestItemsEditor = ({
  items,
  errors,
  showErrors,
  onChange,
}: Readonly<RequestItemsEditorProps>) => {
  const { t } = useTranslation('purchases');
  const units = useUnitOptions();
  const unitData = (units.data ?? []).map((unit) => ({ value: unit.id, label: unit.name }));
  const update = (key: string, patch: Partial<RequestFormItem>) =>
    onChange(items.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  return (
    <>
      <Table.ScrollContainer minWidth={860}>
        <Table verticalSpacing="xs" horizontalSpacing="xs">
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              {['kind', 'item', 'specification', 'quantity', 'unit'].map((key) => (
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
              const number = index + 1;
              return (
                <Table.Tr key={item.key} style={{ verticalAlign: 'top' }}>
                  <Table.Td w={120}>
                    <Select
                      radius="md"
                      allowDeselect={false}
                      aria-label={t('requests.form.kindAria', { number })}
                      data={KINDS.map((kind) => ({
                        value: kind,
                        label: t(`requests.kind.${kind}`),
                      }))}
                      value={item.kind}
                      onChange={(kind) =>
                        kind && update(item.key, { kind: kind as typeof item.kind })
                      }
                    />
                  </Table.Td>
                  <Table.Td miw={240}>
                    <Stack gap={6}>
                      <ProductPicker
                        aria-label={t('requests.form.productAria', { number })}
                        value={item.productId}
                        selectedName={item.productName}
                        onChange={(product) =>
                          update(item.key, {
                            productId: product?.id ?? '',
                            productName: product?.name ?? '',
                            unitId: product?.unitId ?? item.unitId,
                          })
                        }
                      />
                      <TextInput
                        radius="md"
                        aria-label={t('requests.form.descriptionAria', { number })}
                        placeholder={
                          item.productId
                            ? t('requests.form.descriptionOptional')
                            : t('requests.form.descriptionPlaceholder')
                        }
                        value={item.description}
                        error={
                          showErrors && row?.description
                            ? t(`requests.form.itemError.${row.description}`)
                            : undefined
                        }
                        onChange={(event) =>
                          update(item.key, { description: event.currentTarget.value })
                        }
                      />
                    </Stack>
                  </Table.Td>
                  <Table.Td miw={200}>
                    <Textarea
                      radius="md"
                      autosize
                      minRows={1}
                      maxRows={4}
                      aria-label={t('requests.form.specificationAria', { number })}
                      placeholder={t('requests.form.specificationPlaceholder')}
                      value={item.specification}
                      error={
                        showErrors && row?.specification
                          ? t('requests.form.itemError.tooLongSpec', {
                              max: REQUEST_LIMITS.specification,
                            })
                          : undefined
                      }
                      onChange={(event) =>
                        update(item.key, { specification: event.currentTarget.value })
                      }
                    />
                  </Table.Td>
                  <Table.Td w={120}>
                    <NumberInput
                      radius="md"
                      aria-label={t('requests.form.quantityAria', { number })}
                      value={item.quantity}
                      min={0}
                      decimalScale={4}
                      hideControls
                      allowNegative={false}
                      error={
                        showErrors && row?.quantity
                          ? t('requests.form.quantityMin', { min: MIN_QUANTITY })
                          : undefined
                      }
                      onChange={(value) =>
                        update(item.key, { quantity: value === '' ? '' : Number(value) })
                      }
                    />
                  </Table.Td>
                  <Table.Td w={130}>
                    <Select
                      radius="md"
                      searchable
                      clearable
                      aria-label={t('requests.form.unitAria', { number })}
                      placeholder={t('requests.form.unitPlaceholder')}
                      data={unitData}
                      value={item.unitId || null}
                      onChange={(unit) => update(item.key, { unitId: unit ?? '' })}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label={t('requests.form.removeItem')}>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        aria-label={t('requests.form.removeItemAria', { number })}
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
