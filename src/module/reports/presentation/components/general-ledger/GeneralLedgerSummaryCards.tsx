import React from 'react';
import {
  Badge,
  Box,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconBuildingBank,
  IconCheck,
  IconLock,
  IconReceipt2,
} from '@tabler/icons-react';
import type {
  GeneralLedgerReport,
  ReportPeriod,
} from '@/module/reports/domain/generalLedger.types';
import { displayDate, formatCount, formatMoney } from '@/module/reports/domain/reportFormat';

import { useTranslation } from '@/i18n';

interface GeneralLedgerSummaryCardsProps {
  report: GeneralLedgerReport;
  period: ReportPeriod;
  totalTransactions: number;
  isBalanced: boolean;
}

export const GeneralLedgerSummaryCards: React.FC<GeneralLedgerSummaryCardsProps> = ({
  report,
  period,
  totalTransactions,
  isBalanced,
}) => {
  const { t } = useTranslation('reports');
  return (
    <Stack gap="sm">
      {/* Period Header Info */}
      <Group justify="space-between" align="center" wrap="wrap" gap="xs">
        <Group gap="xs" align="center">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
            {t('generalLedger.summaryTitle')}
          </Text>
          <Text size="sm" fw={700} c="dark.8">
            {displayDate(period.startDate)} — {displayDate(period.endDate)}
          </Text>
        </Group>

        <Group gap="xs">
          {report.periodLockType && (
            <Badge
              leftSection={<IconLock size={12} />}
              color={report.periodLockType === 'LOCK' ? 'orange' : 'primary'}
              variant="light"
              size="sm"
            >
              {report.periodLockName ? `${report.periodLockName} · ` : ''}
              {report.periodLockType}
            </Badge>
          )}

          <Tooltip
            label={isBalanced ? t('generalLedger.balancedNote') : t('generalLedger.unbalancedNote')}
          >
            <Badge
              size="sm"
              variant="light"
              color={isBalanced ? 'teal' : 'red'}
              leftSection={isBalanced ? <IconCheck size={13} /> : <IconAlertTriangle size={13} />}
            >
              {isBalanced ? t('generalLedger.badgeBalanced') : t('generalLedger.badgeUnbalanced')}
            </Badge>
          </Tooltip>
        </Group>
      </Group>

      {/* 4 Metric Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {/* Card 1: Akun Aktif */}
        <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                {t('generalLedger.cardAccounts')}
              </Text>
              <Text size="xl" fw={800} c="dark.9" mt={4}>
                {formatCount(report.accounts.length)}
              </Text>
            </Box>
            <ThemeIcon variant="light" color="blue" size={38} radius="md">
              <IconBuildingBank size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            {t('generalLedger.cardAccountsHint')}
          </Text>
        </Paper>

        {/* Card 2: Total Transaksi */}
        <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                {t('generalLedger.cardVolume')}
              </Text>
              <Text size="xl" fw={800} c="dark.9" mt={4}>
                {formatCount(totalTransactions)}
              </Text>
            </Box>
            <ThemeIcon variant="light" color="violet" size={38} radius="md">
              <IconReceipt2 size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            {t('generalLedger.cardVolumeHint')}
          </Text>
        </Paper>

        {/* Card 3: Total Debit */}
        <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                {t('generalLedger.cardTotalDebit')}
              </Text>
              <Text size="xl" fw={800} c="teal.7" mt={4}>
                {formatMoney(report.periodDebitTotal)}
              </Text>
            </Box>
            <ThemeIcon variant="light" color="teal" size={38} radius="md">
              <IconArrowDownLeft size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            {t('generalLedger.cardTotalDebitHint')}
          </Text>
        </Paper>

        {/* Card 4: Total Kredit */}
        <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                {t('generalLedger.cardTotalCredit')}
              </Text>
              <Text size="xl" fw={800} c="red.7" mt={4}>
                {formatMoney(report.periodCreditTotal)}
              </Text>
            </Box>
            <ThemeIcon variant="light" color="red" size={38} radius="md">
              <IconArrowUpRight size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            {t('generalLedger.cardTotalCreditHint')}
          </Text>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
};
