import type { ReactNode } from 'react';
import { Box, Group, Paper, Skeleton, Text } from '@mantine/core';
import classes from './InfoCard.module.css';

type InfoCardProps = {
  /** Small caption at the top left. */
  label: string;
  /** Optional control at the top right (menu, arrow). */
  action?: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  /** Small illustration or icon on the right. */
  visual?: ReactNode;
  loading?: boolean;
  interactive?: boolean;
};

/** Card that aligns with Paper withBorder and shadow="sm" from Mantine */
export function InfoCard({
  label,
  action,
  value,
  hint,
  visual,
  loading,
  interactive,
}: Readonly<InfoCardProps>) {
  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      bg="white"
      className={classes.card}
      data-interactive={interactive || undefined}
    >
      <Group justify="space-between" wrap="nowrap" mb="sm" mih={22}>
        <Text size="xs" c="dimmed" fw={500} truncate>
          {label}
        </Text>
        {action}
      </Group>
      <Group justify="space-between" align="center" gap="xs" wrap="nowrap">
        <Box style={{ minWidth: 0 }}>
          {loading ? (
            <Skeleton h={28} w={112} />
          ) : (
            <Text className={classes.value} truncate>
              {value}
            </Text>
          )}
          {hint !== undefined && (
            <Text size="xs" c="dimmed" mt={6} lineClamp={2}>
              {loading ? '…' : hint}
            </Text>
          )}
        </Box>
        {!loading && visual && <Box className={classes.visual}>{visual}</Box>}
      </Group>
    </Paper>
  );
}
