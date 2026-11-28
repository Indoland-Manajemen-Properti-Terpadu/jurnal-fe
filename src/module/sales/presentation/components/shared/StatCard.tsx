import type { ReactNode } from 'react';
import { Group, Paper, SimpleGrid, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';

export type StatTone = 'primary' | 'orange' | 'green' | 'red' | 'gray';

interface StatCardProps {
  label: string;
  value: string;
  caption?: string;
  icon: ReactNode;
  tone?: StatTone;
  loading?: boolean;
  compact?: boolean;
}

/**
 * One figure of a list's summary in its own card: the label, the value, a line of context and an
 * icon tile in the figure's colour. Every card in every list looks the same: no bars, no rings.
 */
export function StatCard({
  label,
  value,
  caption,
  icon,
  tone = 'primary',
  loading,
  compact = false,
}: Readonly<StatCardProps>) {
  return (
    <Paper withBorder radius="lg" p={compact ? 'md' : 'lg'} bg="white">
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap={compact ? 'sm' : 'md'}>
        <Stack gap={4} style={{ minWidth: 0 }}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
            {label}
          </Text>
          {loading ? (
            <Skeleton height={30} width={150} radius="sm" />
          ) : (
            <Text
              fw={800}
              fz={compact ? 24 : 26}
              lh={1.2}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {value}
            </Text>
          )}
          {caption && (
            <Text size="xs" c="dimmed">
              {caption}
            </Text>
          )}
        </Stack>
        <ThemeIcon size={compact ? 40 : 44} radius="md" variant="light" color={tone}>
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
}

/** A row of separate cards, three (or four) across on a wide screen and one on a phone. */
export const StatCardRow = ({
  children,
  columns = 3,
}: Readonly<{ children: ReactNode; columns?: 3 | 4 }>) => (
  <SimpleGrid cols={{ base: 1, sm: 2, lg: columns }} spacing="md">
    {children}
  </SimpleGrid>
);
