import { Alert, Box, Group, Paper, Stack, Table, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { BillEstimate } from '@/module/purchases/domain/billSources';
import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import {
  formatAmount,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';

const COLUMNS = ['item', 'from', 'open', 'qty', 'price', 'amount'] as const;
const RIGHT = new Set(['open', 'qty', 'price', 'amount']);

/** The lines the bill will take from the picked documents, with the three-way matching reminder. */
export const BillPickedItems = ({ estimate }: Readonly<{ estimate: BillEstimate }>) => {
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
                    <Text size="sm" fw={700}>
                      {row.description}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {row.from}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm">{formatQuantity(row.qty)}</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm">{formatQuantity(row.qty)}</Text>
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
export const BillEstimateSummary = ({ estimate }: Readonly<{ estimate: BillEstimate }>) => {
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
        {row(t('bills.wizard.summary.subtotal'), formatAmount(estimate.subtotal))}
        {estimate.tax > 0 &&
          row(
            estimate.taxRate
              ? t('bills.wizard.summary.taxRate', { rate: estimate.taxRate })
              : t('bills.wizard.summary.tax'),
            `+${formatAmount(estimate.tax)}`
          )}
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
          {formatAmount(estimate.total)}
        </Text>
      </Group>
      <Text size="xs" c="dimmed" mt="xs" ta="right">
        {t('bills.wizard.summary.estimate')}
      </Text>
    </Box>
  );
};
