import React from 'react';
import { Badge, Box, Grid, Group, Text } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconScale } from '@tabler/icons-react';
import { useTransactionStore } from '@/store/GeneralJournal/useTransactionStore';
import { themeColors } from '@/theme';

const TotalAmount: React.FC = () => {
  const { totalDebit, totalCredit } = useTransactionStore();
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && totalCredit > 0 && diff === 0;
  const hasValues = totalDebit > 0 || totalCredit > 0;

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
            <Text fw={700} fz={13} c="dark.8">
              Total Ayat Jurnal
            </Text>
            {isBalanced ? (
              <Badge color="green" variant="filled" size="sm" leftSection={<IconCheck size={12} />}>
                Seimbang
              </Badge>
            ) : hasValues ? (
              <Badge
                color="red"
                variant="filled"
                size="sm"
                leftSection={<IconAlertCircle size={12} />}
              >
                Selisih: Rp {diff.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
              </Badge>
            ) : (
              <Badge color="gray" variant="light" size="sm">
                Belum Terisi
              </Badge>
            )}
          </Group>
        </Grid.Col>
        <Grid.Col span={7}>
          {hasValues && !isBalanced && (
            <Text fz={11} c="red.7" fw={500}>
              * Total debit dan kredit harus bernilai sama sebelum dapat disimpan.
            </Text>
          )}
        </Grid.Col>
        <Grid.Col span={4}>
          <Box ta="right">
            <Text fz={11} c="dimmed" fw={600} tt="uppercase">
              Total Debit
            </Text>
            <Text fw={700} fz={14} c={themeColors.primary[7]}>
              Rp {totalDebit.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
            </Text>
          </Box>
        </Grid.Col>
        <Grid.Col span={4}>
          <Box ta="right">
            <Text fz={11} c="dimmed" fw={600} tt="uppercase">
              Total Kredit
            </Text>
            <Text fw={700} fz={14} c={themeColors.primary[7]}>
              Rp {totalCredit.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
            </Text>
          </Box>
        </Grid.Col>
        <Grid.Col span={1} />
      </Grid>
    </Box>
  );
};

export default TotalAmount;
