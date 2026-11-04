import { useState } from 'react';
import { SimpleGrid, Stack, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconClockHour4 } from '@tabler/icons-react';
import { todayWib } from '@/module/petty-cash/domain/wibDate';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { AGING_BUCKETS } from '@/module/petty-cash/domain/reports';
import {
  DocumentNumber,
  DocumentTable,
  TotalFigure,
} from '@/module/petty-cash/presentation/components/DocumentTable';
import {
  ReportShell,
  StatTile,
} from '@/module/petty-cash/presentation/components/reports/ReportShell';
import { usePendingVouchersReport } from '@/module/petty-cash/presentation/hooks/useReportQueries';

const money = (amount: number) => formatCurrency(amount, false);
const OLDEST = AGING_BUCKETS[AGING_BUCKETS.length - 1];

/** Approved vouchers still waiting for a refill, grouped by age; the oldest bucket is flagged. */
export function PendingVouchersReport({ fundId }: Readonly<{ fundId: string }>) {
  const { t } = useTranslation('pettyCash');
  const [asOf, setAsOf] = useState(todayWib());
  const query = usePendingVouchersReport(fundId, asOf);
  const report = query.data;

  return (
    <ReportShell title={t('reports.sections.pending')} hint={t('reports.pending.hint')}>
      <Stack gap="md">
        {report && (
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
            {AGING_BUCKETS.map((bucket) => (
              <StatTile
                key={bucket}
                label={t(`reports.pending.bucket.${bucket}`)}
                value={money(report.summary[bucket].amount)}
                detail={t('reports.pending.count', { count: report.summary[bucket].count })}
                emphasis={bucket === OLDEST && report.summary[bucket].count > 0}
              />
            ))}
          </SimpleGrid>
        )}
        <DocumentTable
          filters={
            <DatePickerInput
              aria-label={t('reports.asOf')}
              leftSection={
                <Text size="xs" c="dimmed" pl={4}>
                  {t('reports.asOf')}
                </Text>
              }
              leftSectionWidth={90}
              value={asOf}
              onChange={(value) => value && setAsOf(value)}
              valueFormat="DD/MM/YYYY"
              w={{ base: '100%', sm: 240 }}
            />
          }
          columns={[
            { key: 'number', label: t('reports.pending.columns.number') },
            { key: 'date', label: t('reports.pending.columns.date') },
            { key: 'beneficiary', label: t('reports.pending.columns.beneficiary') },
            { key: 'age', label: t('reports.pending.columns.age'), numeric: true },
            { key: 'amount', label: t('reports.pending.columns.amount'), numeric: true },
          ]}
          items={report?.items}
          rowKey={(item) => item.id}
          cells={(item) => [
            <DocumentNumber key="number" number={item.voucherNumber} />,
            dateFormatV1(item.transactionDate),
            item.beneficiary,
            t('reports.pending.ageDays', { count: item.ageDays }),
            money(item.totalAmount),
          ]}
          minWidth={600}
          loading={query.isLoading}
          fetching={query.isFetching}
          stale={false}
          error={
            query.isError
              ? {
                  title: t('reports.loadFailed'),
                  error: query.error,
                  onRetry: () => query.refetch(),
                }
              : null
          }
          empty={{
            icon: <IconClockHour4 size={32} />,
            title: t('reports.emptyTitle'),
            description: t('reports.empty'),
          }}
          footer={report && <TotalFigure label={t('reports.total')} value={money(report.total)} />}
        />
      </Stack>
    </ReportShell>
  );
}
