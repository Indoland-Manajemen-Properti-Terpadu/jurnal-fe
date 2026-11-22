import {
  ActionIcon,
  Button,
  NumberInput,
  Select,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useSimpleAccounts } from '@/module/chart-of-accounts';
import { useTranslation } from '@/i18n';
import {
  emptyManualLine,
  type BillFormErrors,
  type ManualLine,
} from '@/module/purchases/domain/billForm';
import { ProductPicker } from '@/module/purchases/presentation/components/requests/ProductPicker';
import { useTaxOptions } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface BillManualLinesProps {
  lines: ManualLine[];
  errors: BillFormErrors;
  showErrors: boolean;
  onChange: (lines: ManualLine[]) => void;
}

const MONEY = {
  decimalScale: 2,
  thousandSeparator: '.',
  decimalSeparator: ',',
  hideControls: true,
} as const;

/** The lines of a bill typed in by hand (electricity, rent): a product or an account, a quantity and a price. */
export const BillManualLines = ({
  lines,
  errors,
  showErrors,
  onChange,
}: Readonly<BillManualLinesProps>) => {
  const { t } = useTranslation('purchases');
  const { accounts } = useSimpleAccounts();
  const taxes = useTaxOptions();
  const update = (key: string, patch: Partial<ManualLine>) =>
    onChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  return (
    <>
      <Table.ScrollContainer type="native" minWidth={900}>
        <Table className={tableClasses.table} verticalSpacing="xs" horizontalSpacing="xs">
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              {['product', 'account', 'description', 'quantity', 'unitPrice', 'tax'].map((key) => (
                <Table.Th key={key}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    {t(`bills.form.col.${key}`)}
                  </Text>
                </Table.Th>
              ))}
              <Table.Th w={44} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {lines.map((line, index) => {
              const row = errors.lines[line.key];
              const number = index + 1;
              return (
                <Table.Tr key={line.key} style={{ verticalAlign: 'top' }}>
                  <Table.Td miw={200}>
                    <ProductPicker
                      aria-label={t('bills.form.productAria', { number })}
                      value={line.productId}
                      selectedName={line.productName}
                      onChange={(product) =>
                        update(line.key, {
                          productId: product?.id ?? '',
                          productName: product?.name ?? '',
                          accountId: product ? '' : line.accountId,
                        })
                      }
                    />
                  </Table.Td>
                  <Table.Td miw={200}>
                    <Select
                      radius="md"
                      searchable
                      clearable
                      disabled={Boolean(line.productId)}
                      aria-label={t('bills.form.accountAria', { number })}
                      placeholder={t('bills.form.accountPlaceholder')}
                      data={accounts.map((account) => ({
                        value: account.id,
                        label: `${account.accountNumber} ${account.name}`,
                      }))}
                      value={line.accountId || null}
                      onChange={(value) => update(line.key, { accountId: value ?? '' })}
                      error={
                        showErrors && row?.target ? t('bills.form.error.targetRequired') : undefined
                      }
                    />
                  </Table.Td>
                  <Table.Td miw={180}>
                    <TextInput
                      radius="md"
                      aria-label={t('bills.form.descriptionAria', { number })}
                      value={line.description}
                      onChange={(event) =>
                        update(line.key, { description: event.currentTarget.value })
                      }
                    />
                  </Table.Td>
                  <Table.Td w={110}>
                    <NumberInput
                      radius="md"
                      aria-label={t('bills.form.quantityAria', { number })}
                      min={0}
                      decimalScale={4}
                      hideControls
                      allowNegative={false}
                      value={line.quantity}
                      onChange={(value) =>
                        update(line.key, { quantity: value === '' ? '' : Number(value) })
                      }
                      error={
                        showErrors && row?.quantity
                          ? t('bills.form.error.quantityPositive')
                          : undefined
                      }
                    />
                  </Table.Td>
                  <Table.Td w={150}>
                    <NumberInput
                      radius="md"
                      aria-label={t('bills.form.priceAria', { number })}
                      prefix="Rp "
                      min={0}
                      allowNegative={false}
                      {...MONEY}
                      value={line.unitPrice}
                      onChange={(value) =>
                        update(line.key, { unitPrice: value === '' ? '' : Number(value) })
                      }
                      error={
                        showErrors && row?.unitPrice
                          ? t('bills.form.error.pricePositive')
                          : undefined
                      }
                    />
                  </Table.Td>
                  <Table.Td w={160}>
                    <Select
                      radius="md"
                      clearable
                      aria-label={t('bills.form.taxAria', { number })}
                      placeholder={t('bills.form.noTax')}
                      data={(taxes.data ?? []).map((tax) => ({
                        value: tax.id,
                        label: `${tax.name} (${tax.rate}%)`,
                      }))}
                      value={line.taxId || null}
                      onChange={(value) => update(line.key, { taxId: value ?? '' })}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label={t('bills.form.removeLine')}>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        mt={4}
                        disabled={lines.length === 1}
                        aria-label={t('bills.form.removeLineAria', { number })}
                        onClick={() => onChange(lines.filter((other) => other.key !== line.key))}
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
      {showErrors && errors.fields.lines && (
        <Text size="sm" c="red">
          {t('bills.form.error.linesEmpty')}
        </Text>
      )}
      <Button
        fullWidth
        variant="light"
        size="sm"
        radius="md"
        leftSection={<IconPlus size={14} />}
        onClick={() => onChange([...lines, emptyManualLine()])}
      >
        {t('bills.form.addLine')}
      </Button>
    </>
  );
};
