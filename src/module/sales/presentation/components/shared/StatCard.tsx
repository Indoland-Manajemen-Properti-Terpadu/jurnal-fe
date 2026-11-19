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
}: Readonly<StatCardProps>) {
  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
        <Stack gap={4} style={{ minWidth: 0 }}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
            {label}
          </Text>
          {loading ? (
            <Skeleton height={30} width={150} radius="sm" />
          ) : (
            <Text fw={800} fz={26} lh={1.2} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </Text>
          )}
          {caption && (
            <Text size="xs" c="dimmed">
              {caption}
            </Text>
          )}
        </Stack>
        <ThemeIcon size={44} radius="md" variant="light" color={tone}>
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
}

/** A row of separate cards, three across on a wide screen and one on a phone. */
export const StatCardRow = ({ children }: Readonly<{ children: ReactNode }>) => (
  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
    {children}
  </SimpleGrid>
);
