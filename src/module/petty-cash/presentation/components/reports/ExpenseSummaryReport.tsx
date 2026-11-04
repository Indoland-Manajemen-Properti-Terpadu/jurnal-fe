import { useState } from 'react';
import { Group, Progress, SegmentedControl, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconChartBar } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { ExpenseGroup } from '@/module/petty-cash/domain/reports';
import {
  DocumentTable,
  TotalFigure,
} from '@/module/petty-cash/presentation/components/DocumentTable';
import { ReportShell } from '@/module/petty-cash/presentation/components/reports/ReportShell';
import { useExpenseSummaryReport } from '@/module/petty-cash/presentation/hooks/useReportQueries';

const money = (amount: number) => formatCurrency(amount, false);
const GROUPS: ExpenseGroup[] = ['account', 'tag', 'month'];

/** Booked petty cash spending, grouped as chosen, each group with its share of the total. */
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
  // Share is a display proportion of the server's own figures, not a new amount.
  const share = (amount: number) =>
    report && report.total > 0 ? Math.round((amount / report.total) * 100) : 0;

  return (
    <ReportShell title={t('reports.sections.expense')} hint={t('reports.expense.hint')}>
      <DocumentTable
        filters={
          <>
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
              w={{ base: '100%', sm: 260 }}
            />
          </>
        }
        columns={[
          { key: 'group', label: t('reports.expense.columns.group') },
          { key: 'share', label: t('reports.expense.columns.share') },
          { key: 'lines', label: t('reports.expense.columns.lines'), numeric: true },
          { key: 'amount', label: t('reports.expense.columns.amount'), numeric: true },
          { key: 'tax', label: t('reports.expense.columns.tax'), numeric: true },
        ]}
        items={report?.items}
        rowKey={(item) => item.key}
        cells={(item) => [
          <Text key="group" size="sm" c="dark.8">
            {item.label}
          </Text>,
          <Group key="share" gap="xs" wrap="nowrap" miw={140}>
            <Progress value={share(item.amount)} size={6} radius="xl" color="primary" w={90} />
            <Text size="xs" c="dimmed" w={36}>
              {share(item.amount)}%
            </Text>
          </Group>,
          item.lineCount,
          money(item.amount),
          money(item.taxAmount),
        ]}
        minWidth={640}
        loading={query.isLoading}
        fetching={query.isFetching}
        stale={false}
        error={
          query.isError
            ? { title: t('reports.loadFailed'), error: query.error, onRetry: () => query.refetch() }
            : null
        }
        empty={{
          icon: <IconChartBar size={32} />,
          title: t('reports.emptyTitle'),
          description: t('reports.empty'),
        }}
        footer={
          report && (
            <>
              <TotalFigure label={t('reports.total')} value={money(report.total)} />
              <TotalFigure label={t('reports.expense.totalTax')} value={money(report.totalTax)} />
            </>
          )
        }
      />
    </ReportShell>
  );
}
