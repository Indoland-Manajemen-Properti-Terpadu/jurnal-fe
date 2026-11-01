import React from 'react';
import { Badge, Box, Group, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import {
  IconAlertCircle,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconCheck,
  IconListTree,
  IconScale,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { summarizeLines } from '../../domain/journalRules';
import { useTransactionStore } from '../store/useTransactionStore';

export const JournalBalanceMetrics: React.FC = () => {
  const { t } = useTranslation('journalEntries');
  const transactions = useTransactionStore((state) => state.transactions);
  const { totalDebit, totalCredit, difference, isBalanced, hasValues } =
    summarizeLines(transactions);

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      {/* Metric 1: Total Debit */}
      <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
        <Group justify="space-between" align="flex-start">
          <Box>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts={0.5}>
              {t('metrics.totalDebit')}
            </Text>
            <Text fz="var(--jurnal-text-xl)" fw={800} c="teal.8" mt={4} lh={1.2}>
              Rp {totalDebit.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              {t('metrics.debitCaption')}
            </Text>
          </Box>
          <ThemeIcon size={38} radius="md" variant="light" color="teal">
            <IconArrowUpRight size={20} />
          </ThemeIcon>
        </Group>
      </Paper>

      {/* Metric 2: Total Kredit */}
      <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
        <Group justify="space-between" align="flex-start">
          <Box>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts={0.5}>
              {t('metrics.totalCredit')}
            </Text>
            <Text fz="var(--jurnal-text-xl)" fw={800} c="red.8" mt={4} lh={1.2}>
              Rp {totalCredit.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              {t('metrics.creditCaption')}
            </Text>
          </Box>
          <ThemeIcon size={38} radius="md" variant="light" color="red">
            <IconArrowDownLeft size={20} />
          </ThemeIcon>
        </Group>
      </Paper>

      {/* Metric 3: Status Keseimbangan */}
      <Paper
        withBorder
        radius="md"
        p="md"
        bg={isBalanced ? 'green.0' : hasValues ? 'red.0' : 'white'}
        shadow="xs"
        style={{
          borderColor: isBalanced
            ? 'var(--mantine-color-green-3)'
            : hasValues
              ? 'var(--mantine-color-red-3)'
              : undefined,
          transition: 'all 0.2s ease',
        }}
      >
        <Group justify="space-between" align="flex-start">
          <Box>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts={0.5}>
              {t('metrics.statusTitle')}
            </Text>
            {isBalanced ? (
              <Group gap={6} mt={6}>
                <Badge
                  color="green"
                  variant="filled"
                  size="md"
                  leftSection={<IconCheck size={14} />}
                >
                  {t('metrics.balancedBadge')}
                </Badge>
              </Group>
            ) : hasValues ? (
              <Group gap={6} mt={6}>
                <Badge
                  color="red"
                  variant="filled"
                  size="md"
                  leftSection={<IconAlertCircle size={14} />}
                >
                  {t('metrics.differenceBadge', {
                    amount: difference.toLocaleString('id-ID', { minimumFractionDigits: 0 }),
                  })}
                </Badge>
              </Group>
            ) : (
              <Text fz="var(--jurnal-text-lg)" fw={700} c="dark.5" mt={4}>
                {t('metrics.waiting')}
              </Text>
            )}
            <Text size="xs" c={isBalanced ? 'green.8' : hasValues ? 'red.8' : 'dimmed'} mt={4}>
              {isBalanced
                ? t('metrics.balancedHint')
                : hasValues
                  ? t('metrics.unbalancedHint')
                  : t('metrics.emptyHint')}
            </Text>
          </Box>
          <ThemeIcon
            size={38}
            radius="md"
            variant="light"
            color={isBalanced ? 'green' : hasValues ? 'red' : 'gray'}
          >
            <IconScale size={20} />
          </ThemeIcon>
        </Group>
      </Paper>

      {/* Metric 4: Baris Akun Terlibat */}
      <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
        <Group justify="space-between" align="flex-start">
          <Box>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts={0.5}>
              {t('metrics.rowsTitle')}
            </Text>
            <Text fz="var(--jurnal-text-xl)" fw={800} c="dark.8" mt={4} lh={1.2}>
              {t('metrics.rowsValue', { count: transactions.length })}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              {t('metrics.rowsHint')}
            </Text>
          </Box>
          <ThemeIcon size={38} radius="md" variant="light" color="indigo">
            <IconListTree size={20} />
          </ThemeIcon>
        </Group>
      </Paper>
    </SimpleGrid>
  );
};
