import { Alert, Badge, Box, Group, NumberInput, Paper, Stack, Table, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { BillEstimate } from '@/module/purchases/domain/billSources';
import type { BillPreview } from '@/module/purchases/infrastructure/purchaseBillPreview';
import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import {
  formatAmount,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';

const COLUMNS = ['item', 'from', 'open', 'qty', 'price', 'amount'] as const;
const RIGHT = new Set(['open', 'qty', 'price', 'amount']);

/** The lines the bill will take from the picked documents, with the three-way matching reminder. */
export const BillPickedItems = ({
  estimate,
  onQuantity,
}: Readonly<{
  estimate: BillEstimate;
  /** Called with the row key and the quantity typed for it. */
  onQuantity: (key: string, quantity: number) => void;
}>) => {
  const { t } = useTranslation('purchases');
  return (
    <Stack gap="md">
      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
        <Table.ScrollContainer type="native" minWidth={760}>
          <Table className={tableClasses.table} verticalSpacing="md" horizontalSpacing="lg">
            <Table.Thead bg="var(--jurnal-color-surface-muted)">
              <Table.Tr>
                {COLUMNS.map((key) => (
                  <Table.Th key={key} ta={RIGHT.has(key) ? 'right' : undefined}>
                    <Text size="xs" fw={700} c="dark.7">
                      {t(`bills.wizard.itemCol.${key}`)}
                    </Text>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {estimate.rows.map((row) => (
                <Table.Tr key={row.key}>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Text size="sm" fw={700}>
                        {row.description}
                      </Text>
                      {row.isAdvance && (
                        <Badge variant="light" color="primary" radius="sm" size="sm">
                          {t('bills.wizard.advanceTag')}
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {row.from}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm">{formatQuantity(row.max)}</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <NumberInput
                      aria-label={t('bills.wizard.qtyAria', { name: row.description })}
                      value={row.qty}
                      onChange={(value) =>
                        onQuantity(row.key, value === '' ? 0 : Math.min(Number(value), row.max))
                      }
                      min={0}
                      max={row.max}
                      decimalScale={2}
                      hideControls
                      radius="md"
                      size="xs"
                      w={96}
                      ml="auto"
                      styles={{ input: { textAlign: 'right' } }}
                    />
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm">{formatAmount(row.unitPrice)}</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={700}>
                      {formatAmount(row.amount)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
      <Alert
        color="yellow"
        variant="light"
        radius="md"
        icon={<IconAlertTriangle size={18} />}
        title={t('bills.wizard.threeWayTitle')}
      >
        {t('bills.wizard.itemsNote')}
      </Alert>
    </Stack>
  );
};

/** DPP, tax and what the bill adds to payables, right aligned in the grey band under the lines. */
export const BillEstimateSummary = ({
  estimate,
  preview,
}: Readonly<{ estimate: BillEstimate; preview?: BillPreview }>) => {
  const { t } = useTranslation('purchases');
  const row = (label: string, value: string) => (
    <Group key={label} justify="space-between" wrap="nowrap" gap="xl">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
    </Group>
  );
  return (
    <Box maw={380} ml="auto">
      <Stack gap={6}>
        {row(
          t('bills.wizard.summary.subtotal'),
          formatAmount(preview?.taxBase ?? estimate.subtotal)
        )}
        {(preview?.taxAmount ?? estimate.tax) > 0 &&
          row(
            estimate.taxRate
              ? t('bills.wizard.summary.taxRate', { rate: estimate.taxRate })
              : t('bills.wizard.summary.tax'),
            `+${formatAmount(preview?.taxAmount ?? estimate.tax)}`
          )}
        {preview &&
          preview.withholdingAmount > 0 &&
          row(t('bills.wizard.summary.withholding'), `-${formatAmount(preview.withholdingAmount)}`)}
      </Stack>
      <Group
        justify="space-between"
        align="baseline"
        wrap="nowrap"
        gap="xl"
        mt="sm"
        pt="sm"
        style={{ borderTop: '1px solid var(--jurnal-color-border-subtle)' }}
      >
        <Text size="sm" fw={700} c="primary.8">
          {t('bills.wizard.summary.payable')}
        </Text>
        <Text fz={22} fw={700} c="primary.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatAmount(preview?.finalAmount ?? estimate.total)}
        </Text>
      </Group>
      <Text size="xs" c="dimmed" mt="xs" ta="right">
        {t(preview ? 'bills.wizard.summary.calculated' : 'bills.wizard.summary.estimate')}
      </Text>
    </Box>
  );
};
