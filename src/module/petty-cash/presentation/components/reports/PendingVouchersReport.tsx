import { useState } from 'react';
import { Group, Paper, SimpleGrid, Table, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { AGING_BUCKETS } from '@/module/petty-cash/domain/reports';
import { ReportShell } from '@/module/petty-cash/presentation/components/reports/ReportShell';
import { usePendingVouchersReport } from '@/module/petty-cash/presentation/hooks/useReportQueries';

const money = (amount: number) => formatCurrency(amount, false);

export function PendingVouchersReport({ fundId }: Readonly<{ fundId: string }>) {
  const { t } = useTranslation('pettyCash');
  const [asOf, setAsOf] = useState(dayjs().format('YYYY-MM-DD'));
  const query = usePendingVouchersReport(fundId, asOf);
  const report = query.data;

  return (
    <ReportShell
      hint={t('reports.pending.hint')}
      query={query}
      controls={
        <DatePickerInput
          label={t('reports.asOf')}
          value={asOf}
          onChange={(value) => value && setAsOf(value)}
          valueFormat="DD/MM/YYYY"
          w={{ base: '100%', sm: 220 }}
        />
      }
    >
      {report && (
        <>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
            {AGING_BUCKETS.map((bucket) => (
              <Paper key={bucket} withBorder radius="md" p="sm" bg="white">
                <Text size="xs" c="dimmed">
                  {t(`reports.pending.bucket.${bucket}`)}
                </Text>
                <Text fw={700}>{money(report.summary[bucket].amount)}</Text>
                <Text size="xs" c="dimmed">
                  {t('reports.pending.count', { count: report.summary[bucket].count })}
                </Text>
              </Paper>
            ))}
          </SimpleGrid>
          {report.items.length === 0 ? (
            <Text size="sm" c="dimmed">
              {t('reports.empty')}
            </Text>
          ) : (
            <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
              <Table.ScrollContainer minWidth={560}>
                <Table verticalSpacing="sm" horizontalSpacing="md">
                  <Table.Thead bg="gray.0">
                    <Table.Tr>
                      <Table.Th>{t('reports.pending.columns.number')}</Table.Th>
                      <Table.Th>{t('reports.pending.columns.date')}</Table.Th>
                      <Table.Th>{t('reports.pending.columns.beneficiary')}</Table.Th>
                      <Table.Th ta="right">{t('reports.pending.columns.age')}</Table.Th>
                      <Table.Th ta="right">{t('reports.pending.columns.amount')}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {report.items.map((item) => (
                      <Table.Tr key={item.id}>
                        <Table.Td fw={600}>{item.voucherNumber}</Table.Td>
                        <Table.Td>{dateFormatV1(item.transactionDate)}</Table.Td>
                        <Table.Td>{item.beneficiary}</Table.Td>
                        <Table.Td ta="right">
                          {t('reports.pending.ageDays', { count: item.ageDays })}
                        </Table.Td>
                        <Table.Td ta="right">{money(item.totalAmount)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Paper>
          )}
          <Group justify="flex-end">
            <Text fw={700}>
              {t('reports.total')}: {money(report.total)}
            </Text>
          </Group>
        </>
      )}
    </ReportShell>
  );
}
