import { useState } from 'react';
import { Group, Paper, SegmentedControl, Table, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { ExpenseGroup } from '@/module/petty-cash/domain/reports';
import { ReportShell } from '@/module/petty-cash/presentation/components/reports/ReportShell';
import { useExpenseSummaryReport } from '@/module/petty-cash/presentation/hooks/useReportQueries';

const money = (amount: number) => formatCurrency(amount, false);
const GROUPS: ExpenseGroup[] = ['account', 'tag', 'month'];

export function ExpenseSummaryReport({ fundId }: Readonly<{ fundId: string }>) {
  const { t } = useTranslation('pettyCash');
  const [groupBy, setGroupBy] = useState<ExpenseGroup>('account');
  const [range, setRange] = useState<[string | null, string | null]>([null, null]);
  const query = useExpenseSummaryReport({
    fundId,
    groupBy,
    from: range[0] ?? undefined,
    to: range[1] ?? undefined,
  });
  const report = query.data;

  return (
    <ReportShell
      hint={t('reports.expense.hint')}
      query={query}
      controls={
        <Group align="flex-end" gap="md" wrap="wrap">
          <SegmentedControl
            aria-label={t('reports.expense.groupBy')}
            value={groupBy}
            onChange={(value) => setGroupBy(value as ExpenseGroup)}
            data={GROUPS.map((value) => ({ value, label: t(`reports.expense.group.${value}`) }))}
          />
          <DatePickerInput
            type="range"
            allowSingleDateInRange
            clearable
            placeholder={`${t('reports.expense.from')} - ${t('reports.expense.to')}`}
            aria-label={`${t('reports.expense.from')} - ${t('reports.expense.to')}`}
            value={range}
            onChange={(value) => setRange(value as [string | null, string | null])}
            valueFormat="DD/MM/YYYY"
            clearButtonProps={{ 'aria-label': t('common.clearFilters') }}
            w={{ base: '100%', sm: 280 }}
          />
        </Group>
      }
    >
      {report &&
        (report.items.length === 0 ? (
          <Text size="sm" c="dimmed">
            {t('reports.empty')}
          </Text>
        ) : (
          <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
            <Table.ScrollContainer minWidth={480}>
              <Table verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead bg="gray.0">
                  <Table.Tr>
                    <Table.Th>{t('reports.expense.columns.group')}</Table.Th>
                    <Table.Th ta="right">{t('reports.expense.columns.lines')}</Table.Th>
                    <Table.Th ta="right">{t('reports.expense.columns.amount')}</Table.Th>
                    <Table.Th ta="right">{t('reports.expense.columns.tax')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {report.items.map((item) => (
                    <Table.Tr key={item.key}>
                      <Table.Td>{item.label}</Table.Td>
                      <Table.Td ta="right">{item.lineCount}</Table.Td>
                      <Table.Td ta="right">{money(item.amount)}</Table.Td>
                      <Table.Td ta="right">{money(item.taxAmount)}</Table.Td>
                    </Table.Tr>
                  ))}
                  <Table.Tr bg="gray.0">
                    <Table.Td fw={700} colSpan={2}>
                      {t('reports.total')}
                    </Table.Td>
                    <Table.Td ta="right" fw={700}>
                      {money(report.total)}
                    </Table.Td>
                    <Table.Td ta="right" fw={700}>
                      {money(report.totalTax)}
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        ))}
    </ReportShell>
  );
}
