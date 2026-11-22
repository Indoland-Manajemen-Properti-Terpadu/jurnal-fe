import type { ReactNode } from 'react';
import { Box, Divider, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';

interface SectionCardProps {
  icon: Icon;
  title: string;
  subtitle?: string;
  /** "2 produk": a small count on the right of the header. */
  count?: string;
  /** Right-aligned control in the card header. */
  action?: ReactNode;
  /** The body runs edge to edge: a table, a fact grid. */
  flush?: boolean;
  /** Grow to the height of its row, beside a taller neighbour. */
  fill?: boolean;
  children: ReactNode;
}

/**
 * A titled card of a detail or form page, the same as Purchasing: icon tile, title and a dimmed
 * line, a hairline, and the body.
 */
export const SectionCard = ({
  icon: CardIcon,
  title,
  subtitle,
  count,
  action,
  flush,
  fill,
  children,
}: Readonly<SectionCardProps>) => (
  <Paper
    withBorder
    radius="lg"
    p={0}
    bg="white"
    h={fill ? '100%' : undefined}
    style={{ overflow: 'hidden' }}
  >
    <Group justify="space-between" align="center" wrap="wrap" px="lg" py="md" gap="sm">
      <Group gap="sm" wrap="nowrap" align="center" style={{ minWidth: 0 }}>
        <ThemeIcon size={36} radius="md" variant="light" color="primary" style={{ flexShrink: 0 }}>
          <CardIcon size={18} stroke={1.8} />
        </ThemeIcon>
        <div style={{ minWidth: 0 }}>
          <Text fw={700} fz="md" lh={1.3}>
            {title}
          </Text>
          {subtitle && (
            <Text fz="xs" c="dimmed">
              {subtitle}
            </Text>
          )}
        </div>
      </Group>
      {(count || action) && (
        <Group gap="sm" wrap="nowrap">
          {count && (
            <Text fz="xs" c="dimmed" fw={600}>
              {count}
            </Text>
          )}
          {action}
        </Group>
      )}
    </Group>
    <Divider />
    <Box p={flush ? 0 : 'lg'}>{flush ? children : <Stack gap="md">{children}</Stack>}</Box>
  </Paper>
);
