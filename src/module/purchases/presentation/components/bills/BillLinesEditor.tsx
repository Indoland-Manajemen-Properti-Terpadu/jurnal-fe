import { Button, Group, NumberInput, Select, Table, Text } from '@mantine/core';
import { IconRestore } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  clampBilled,
  toNumber,
  type BillFormValues,
  type BillLineValues,
  type BillableLine,
} from '@/module/purchases/domain/billForm';
import type { TaxRef } from '@/module/purchases/domain/purchaseCommon';
import {
  formatAmount,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';

interface BillLinesEditorProps {
  lines: BillableLine[];
  values: BillFormValues['lines'];
  taxes: TaxRef[];
  invalidIds: string[];
  showErrors: boolean;
  customized: boolean;
  onChange: (itemId: string, patch: Partial<BillLineValues>) => void;
  onReset: () => void;
}

/** The lines of the bill; by default everything received and not yet billed, at the order's price. */
export const BillLinesEditor = ({
  lines,
  values,
  taxes,
  invalidIds,
  showErrors,
  customized,
  onChange,
  onReset,
}: Readonly<BillLinesEditorProps>) => {
  const { t } = useTranslation('purchases');

  return (
    <>
      <Group justify="space-between" mb="xs" wrap="nowrap" gap="sm">
        <Text size="sm" c="dimmed">
          {customized ? t('bills.form.modeCustom') : t('bills.form.modeDefault')}
        </Text>
        {customized && (
          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconRestore size={14} />}
            onClick={onReset}
          >
            {t('bills.form.resetLines')}
          </Button>
        )}
      </Group>
      <Table.ScrollContainer minWidth={760}>
        <Table verticalSpacing="xs" horizontalSpacing="xs">
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              {['item', 'quantity', 'unitPrice', 'tax', 'amount'].map((key) => (
                <Table.Th key={key} ta={key === 'amount' ? 'right' : undefined}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    {t(`bills.form.col.${key}`)}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {lines.map((line) => {
              const current = values[line.itemId] ?? { quantity: 0, unitPrice: 0, taxId: '' };
              const priceChanged = current.unitPrice !== line.poUnitPrice;
              return (
                <Table.Tr key={line.itemId} style={{ verticalAlign: 'top' }}>
                  <Table.Td miw={170}>
                    <Text size="sm" pt={7}>
                      {line.name}
                    </Text>
                  </Table.Td>
                  <Table.Td w={140}>
                    <NumberInput
                      radius="md"
                      aria-label={t('bills.form.quantityAria', { item: line.name })}
                      value={current.quantity}
                      min={0}
                      max={line.maxQty}
                      hideControls
                      allowNegative={false}
                      decimalScale={4}
                      description={t('bills.form.maxQty', {
                        max: formatQuantity(line.maxQty),
                        unit: line.unitName ?? '',
                      })}
                      error={
                        showErrors && invalidIds.includes(line.itemId)
                          ? t('bills.form.lineInvalid')
                          : undefined
                      }
                      onChange={(value) =>
                        onChange(line.itemId, { quantity: clampBilled(value, line.maxQty) })
                      }
                    />
                  </Table.Td>
                  <Table.Td w={180}>
                    <NumberInput
                      radius="md"
                      aria-label={t('bills.form.priceAria', { item: line.name })}
                      value={current.unitPrice}
                      min={0}
                      hideControls
                      allowNegative={false}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="Rp "
                      description={
                        priceChanged
                          ? t('bills.form.orderPrice', { price: formatAmount(line.poUnitPrice) })
                          : undefined
                      }
                      onChange={(value) =>
                        onChange(line.itemId, { unitPrice: Number(toNumber(value) || 0) })
                      }
                    />
                  </Table.Td>
                  <Table.Td w={190}>
                    <Select
                      radius="md"
                      clearable
                      aria-label={t('bills.form.taxAria', { item: line.name })}
                      placeholder={t('bills.form.noTax')}
                      data={taxes.map((tax) => ({
                        value: tax.id,
                        label: `${tax.name} (${tax.rate}%)`,
                      }))}
                      value={current.taxId || null}
                      onChange={(value) => onChange(line.itemId, { taxId: value ?? '' })}
                    />
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text
                      size="sm"
                      pt={7}
                      style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatAmount(current.quantity * current.unitPrice)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
};
