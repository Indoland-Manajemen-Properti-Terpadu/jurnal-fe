import React from 'react';
import { Box, Grid, Group, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { summarizeLines } from '../../domain/journalRules';
import { useTransactionStore } from '../store/useTransactionStore';

const money = (value: number) => value.toLocaleString('id-ID', { minimumFractionDigits: 2 });

const Dot = ({ tone }: { tone: 'success' | 'danger' | 'muted' }) => (
  <span
    aria-hidden
    style={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      flexShrink: 0,
      background:
        tone === 'success'
          ? 'var(--mantine-color-teal-6)'
          : tone === 'danger'
            ? 'var(--mantine-color-red-6)'
            : 'var(--mantine-color-gray-5)',
    }}
  />
);

/** Footer of the lines table: the two totals under their columns and whether they agree. */
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
        border: '1px solid var(--jurnal-color-border-subtle)',
        background: 'var(--jurnal-color-surface-muted)',
      }}
    >
      <Grid columns={24} gutter="md" align="center">
        <Grid.Col span={1} />
        <Grid.Col span={6}>
          <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
            {t('totals.title')}
          </Text>
          <Group gap={6} wrap="nowrap" mt={2}>
            <Dot tone={isBalanced ? 'success' : hasValues ? 'danger' : 'muted'} />
            <Text
              fz="var(--jurnal-text-xs)"
              fw={600}
              c={isBalanced ? 'teal.8' : hasValues ? 'red.7' : 'dimmed'}
            >
              {isBalanced
                ? t('totals.balanced')
                : hasValues
                  ? t('totals.difference', { amount: money(difference) })
                  : t('totals.empty')}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          {hasValues && !isBalanced && (
            <Text fz="var(--jurnal-text-xs)" c="red.7">
              {t('totals.hint')}
            </Text>
          )}
        </Grid.Col>
        <Grid.Col span={5}>
          <Box ta="right">
            <Text fz="var(--jurnal-text-xs)" c="dimmed" fw={600}>
              {t('totals.totalDebit')}
            </Text>
            <Text
              fw={700}
              fz="var(--jurnal-text-sm)"
              c="dark.8"
              style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
            >
              Rp {money(totalDebit)}
            </Text>
          </Box>
        </Grid.Col>
        <Grid.Col span={5}>
          <Box ta="right">
            <Text fz="var(--jurnal-text-xs)" c="dimmed" fw={600}>
              {t('totals.totalCredit')}
            </Text>
            <Text
              fw={700}
              fz="var(--jurnal-text-sm)"
              c="dark.8"
              style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
            >
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
