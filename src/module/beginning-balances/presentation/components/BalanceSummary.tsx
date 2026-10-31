import React from 'react';
import { Alert, Group, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import {
  IconAlertTriangle,
  IconArrowDownRight,
  IconArrowUpRight,
  IconCalendar,
  IconCheck,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { BalanceState } from '../../domain/beginningBalance';

type Props = {
  totalDebit: number;
  totalCredit: number;
  difference: number;
  balanceState: BalanceState;
  selectedDate: string | null;
};

const BalanceSummary: React.FC<Props> = ({
  totalDebit,
  totalCredit,
  difference,
  balanceState,
  selectedDate,
}) => {
  const { t } = useTranslation('beginningBalances');
  const isBalanced = balanceState === 'balanced';
  const isEmpty = balanceState === 'empty';

  const statusText = isBalanced
    ? t('summary.balanced')
    : isEmpty
      ? t('summary.empty')
      : t('summary.difference', { amount: formatCurrency(difference) });

  const statusHint = isBalanced
    ? t('summary.balancedHint')
    : isEmpty
      ? t('summary.emptyHint')
      : totalDebit > totalCredit
        ? t('summary.creditLowerHint')
        : t('summary.debitLowerHint');

  const statusColor = isBalanced ? 'teal' : isEmpty ? 'gray' : 'orange';

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <Paper withBorder radius="md" p="md" bg="white">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                {t('summary.totalDebit')}
              </Text>
              <Text fz={22} fw={800} c="teal.8" mt={4} lh={1.1} ff="monospace">
                {formatCurrency(totalDebit)}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {t('summary.debitHint')}
              </Text>
            </div>
            <ThemeIcon size={40} radius="md" variant="light" color="teal">
              <IconArrowDownRight size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper withBorder radius="md" p="md" bg="white">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                {t('summary.totalCredit')}
              </Text>
              <Text fz={22} fw={800} c="red.8" mt={4} lh={1.1} ff="monospace">
                {formatCurrency(totalCredit)}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {t('summary.creditHint')}
              </Text>
            </div>
            <ThemeIcon size={40} radius="md" variant="light" color="red">
              <IconArrowUpRight size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper withBorder radius="md" p="md" bg="white">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                {t('summary.balanceStatus')}
              </Text>
              <Text
                fz={22}
                fw={800}
                c={isBalanced ? 'teal.8' : isEmpty ? 'dark.6' : 'orange.8'}
                mt={4}
                lh={1.1}
              >
                {statusText}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {statusHint}
              </Text>
            </div>
            <ThemeIcon size={40} radius="md" variant="light" color={statusColor}>
              {isBalanced ? <IconCheck size={20} /> : <IconAlertTriangle size={20} />}
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper withBorder radius="md" p="md" bg="white">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                {t('summary.cutoffDate')}
              </Text>
              <Text fz={20} fw={800} c="blue.8" mt={4} lh={1.1}>
                {selectedDate ? dayjs(selectedDate).format('DD MMM YYYY') : '-'}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {t('summary.cutoffHint')}
              </Text>
            </div>
            <ThemeIcon size={40} radius="md" variant="light" color="blue">
              <IconCalendar size={20} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
        <Alert
          icon={<IconAlertTriangle size={18} />}
          color="orange"
          variant="light"
          radius="md"
          title={t('alert.unbalancedTitle')}
        >
          {t('alert.unbalancedBefore')} <strong>{formatCurrency(difference)}</strong>{' '}
          {t('alert.unbalancedMiddle')} <strong>{t('alert.draftWord')}</strong>{' '}
          {t('alert.unbalancedAfter')} <strong>{t('alert.publishWord')}</strong>{' '}
          {t('alert.unbalancedEnd')}
        </Alert>
      )}

      {isBalanced && (
        <Alert
          icon={<IconCheck size={18} />}
          color="teal"
          variant="light"
          radius="md"
          title={t('alert.balancedTitle')}
        >
          {t('alert.balancedBody')}
        </Alert>
      )}
    </>
  );
};

export default BalanceSummary;
