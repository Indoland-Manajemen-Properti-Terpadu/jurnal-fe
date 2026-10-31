import React from 'react';
import { Badge, Box, Divider, Group, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconScale } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { useTranslation } from '@/i18n';

import type { ReimbursementLine } from '@/module/petty-cash/domain/reimbursementSummary';

interface ReimbursementJournalPreviewProps {
  total: number;
  breakdown: ReimbursementLine[];
  bankLabel: string | undefined;
}

export const ReimbursementJournalPreview: React.FC<ReimbursementJournalPreviewProps> = ({
  total,
  breakdown,
  bankLabel,
}) => {
  const { t: tp } = useTranslation('pettyCash');

  return (
    <Paper withBorder radius="md" p="md" bg="gray.0">
      <Group justify="space-between" mb="xs">
        <Group gap={6}>
          <ThemeIcon size={24} radius="md" variant="light" color="primary">
            <IconScale size={14} />
          </ThemeIcon>
          <Text fw={700} fz="var(--jurnal-text-xs)" c="dark.9">
            {tp('replenishment.previewTitle')}
          </Text>
        </Group>
        <Badge color="primary" variant="light" size="sm">
          {tp('replenishment.balanced')} {formatCurrency(total)}
        </Badge>
      </Group>

      <Text fz="var(--jurnal-text-xs)" c="dimmed" mb="xs">
        {tp('replenishment.previewNote')}
      </Text>

      <Box
        p="xs"
        bg="white"
        style={{
          borderRadius: 6,
          border: '1px solid var(--mantine-color-gray-2)',
          fontFamily: 'monospace',
          fontSize: 'var(--jurnal-text-xs)',
        }}
      >
        {breakdown.map((item) => (
          <Group key={item.code} justify="space-between" py={2}>
            <Text fz="var(--jurnal-text-xs)" c="dark.8">
              (Dr) {item.code} - {item.name}
            </Text>
            <Text fz="var(--jurnal-text-xs)" fw={700} c="dark.8">
              {formatCurrency(item.amount)}
            </Text>
          </Group>
        ))}
        <Divider my={4} />
        <Group justify="space-between" py={2}>
          <Text fz="var(--jurnal-text-xs)" c="dark.8">
            (Cr) {bankLabel}
          </Text>
          <Text fz="var(--jurnal-text-xs)" fw={700} c="dark.8">
            {formatCurrency(total)}
          </Text>
        </Group>
      </Box>
    </Paper>
  );
};
