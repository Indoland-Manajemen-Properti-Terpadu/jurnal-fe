import React, { useMemo } from 'react';
import { Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import type {
  GeneralLedgerAccount,
  ReportPeriod,
} from '@/module/reports/domain/generalLedger.types';
import {
  buildBalanceSeries,
  groupMovement,
  pickGranularity,
} from '@/module/reports/domain/generalLedgerInsights';
import { useTranslation } from '@/i18n';
import { BalanceTrendChart } from './BalanceTrendChart';
import { GeneralLedgerTransactionsTable } from './GeneralLedgerTransactionsTable';
import { MovementBars } from './MovementBars';

interface GeneralLedgerAccountBodyProps {
  account: GeneralLedgerAccount;
  period: ReportPeriod;
}

const ChartCard = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) => (
  <Paper withBorder radius="md" p="md" bg="white">
    <Text fz="sm" fw={600} c="dark.9">
      {title}
    </Text>
    <Text fz="xs" c="dimmed" mb="md">
      {hint}
    </Text>
    {children}
  </Paper>
);

/** What opens under an account row: its balance trend, its movement per day and its transactions. */
export const GeneralLedgerAccountBody: React.FC<GeneralLedgerAccountBodyProps> = ({
  account,
  period,
}) => {
  const { t } = useTranslation('reports');
  const granularity = pickGranularity(period.startDate, period.endDate);
  const balanceSeries = useMemo(
    () => buildBalanceSeries(account.openingBalance, period.startDate, account.transactions),
    [account, period.startDate]
  );
  const movement = useMemo(
    () => groupMovement(account.transactions, granularity),
    [account, granularity]
  );

  return (
    <Stack gap="lg" pt="xs" pb="md">
      {account.transactions.length > 0 && (
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <ChartCard
            title={t('generalLedger.chartBalanceTitle')}
            hint={t('generalLedger.chartBalanceHint')}
          >
            <BalanceTrendChart points={balanceSeries} />
          </ChartCard>
          <ChartCard
            title={t('generalLedger.chartMovementTitle')}
            hint={t(
              granularity === 'month'
                ? 'generalLedger.chartMovementMonthly'
                : 'generalLedger.chartMovementDaily'
            )}
          >
            <MovementBars buckets={movement} granularity={granularity} />
          </ChartCard>
        </SimpleGrid>
      )}
      <GeneralLedgerTransactionsTable account={account} />
    </Stack>
  );
};
