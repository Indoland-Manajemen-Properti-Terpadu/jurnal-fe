import React from 'react';
import { Badge, Box, Grid, Group, Text } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { themeColors } from '@/theme';
import { summarizeLines } from '../../domain/journalRules';
import { useTransactionStore } from '../store/useTransactionStore';

const money = (value: number) => value.toLocaleString('id-ID', { minimumFractionDigits: 2 });

const JournalTotals: React.FC = () => {
  const { t } = useTranslation('journalEntries');
  const transactions = useTransactionStore((state) => state.transactions);
  const { totalDebit, totalCredit, difference, isBalanced, hasValues } =
    summarizeLines(transactions);

  return (
    <Box
      py="sm"
      px="md"
      style={{
        borderRadius: 8,
        border: `1px solid ${
          isBalanced
            ? 'var(--mantine-color-green-3)'
            : hasValues
              ? 'var(--mantine-color-red-3)'
              : themeColors.slate[2]
        }`,
        backgroundColor: isBalanced
          ? 'var(--mantine-color-green-0)'
          : hasValues
            ? 'var(--mantine-color-red-0)'
            : themeColors.primary[0],
        transition: 'all 0.2s ease',
      }}
    >
      <Grid columns={24} gutter="md" align="center">
        <Grid.Col span={1} />
        <Grid.Col span={7}>
          <Group gap="xs">
            <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
              {t('totals.title')}
            </Text>
            {isBalanced ? (
              <Badge color="green" variant="filled" size="sm" leftSection={<IconCheck size={12} />}>
                {t('totals.balanced')}
              </Badge>
            ) : hasValues ? (
              <Badge
                color="red"
                variant="filled"
                size="sm"
                leftSection={<IconAlertCircle size={12} />}
              >
                {t('totals.difference', { amount: money(difference) })}
              </Badge>
            ) : (
              <Badge color="gray" variant="light" size="sm">
                {t('totals.empty')}
              </Badge>
            )}
          </Group>
        </Grid.Col>
        <Grid.Col span={7}>
          {hasValues && !isBalanced && (
            <Text fz="var(--jurnal-text-xs)" c="red.7" fw={500}>
              {t('totals.hint')}
            </Text>
          )}
        </Grid.Col>
        <Grid.Col span={4}>
          <Box ta="right">
            <Text fz="var(--jurnal-text-xs)" c="dimmed" fw={600} tt="uppercase">
              {t('totals.totalDebit')}
            </Text>
            <Text fw={700} fz="var(--jurnal-text-sm)" c="teal.8">
              Rp {money(totalDebit)}
            </Text>
          </Box>
        </Grid.Col>
        <Grid.Col span={4}>
          <Box ta="right">
            <Text fz="var(--jurnal-text-xs)" c="dimmed" fw={600} tt="uppercase">
              {t('totals.totalCredit')}
            </Text>
            <Text fw={700} fz="var(--jurnal-text-sm)" c="red.8">
              Rp {money(totalCredit)}
            </Text>
          </Box>
        </Grid.Col>
        <Grid.Col span={1} />
      </Grid>
    </Box>
  );
};

export default JournalTotals;
