import { type ReactNode } from 'react';
import { Box, Group, Skeleton, Text, UnstyledButton } from '@mantine/core';
import { IconArrowUpRight } from '@tabler/icons-react';
import classes from './dashboard.module.css';

type KpiTileProps = {
  label: string;
  value: string;
  compactValue?: string;
  hint?: ReactNode;
  loading?: boolean;
  visual?: ReactNode;
  onClick?: () => void;
};

export function KpiTile({
  label,
  value,
  compactValue,
  hint,
  loading,
  visual,
  onClick,
}: Readonly<KpiTileProps>) {
  return (
    <UnstyledButton
      onClick={onClick}
      className={classes.kpiButton}
      aria-label={`${label}: ${value}`}
    >
      <Group justify="space-between" wrap="nowrap" mb="sm">
        <Text size="xs" c="dimmed" fw={500}>
          {label}
        </Text>
        <IconArrowUpRight size={14} className={classes.kpiArrow} />
      </Group>
      <Group justify="space-between" align="center" gap="xs" wrap="nowrap">
        <Box style={{ minWidth: 0 }}>
          {loading ? (
            <Skeleton h={28} w={112} />
          ) : (
            <Text className={classes.kpiValue} title={value}>
              {compactValue ?? value}
            </Text>
          )}
          <Text size="xs" c="dimmed" mt={6}>
            {loading ? '…' : hint}
          </Text>
        </Box>
        {!loading && visual && <Box className={classes.kpiVisual}>{visual}</Box>}
      </Group>
    </UnstyledButton>
  );
}
