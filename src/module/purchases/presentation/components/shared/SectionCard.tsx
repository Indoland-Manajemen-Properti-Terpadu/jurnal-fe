import type { ReactNode } from 'react';
import { Box, Divider, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';

interface SectionCardProps {
  icon: Icon;
  title: string;
  subtitle?: string;
  /** Small capitals title, for the information and summary cards of a document. */
  label?: boolean;
  /** "2 item": a small count on the right of the header. */
  count?: string;
  /** Right-aligned control in the card header. */
  action?: ReactNode;
  /** The body runs edge to edge: a table, a fact grid, a summary. */
  flush?: boolean;
  plain?: boolean;
  children: ReactNode;
}

/**
 * A titled card of a form or detail page, as in the reference web: a header with an icon tile, the
 * title and a dimmed line, a hairline, and the body. `radius="lg"` outside, content pads itself.
 */
export const SectionCard = ({
  icon: CardIcon,
  title,
  subtitle,
  label,
  count,
  action,
  flush,
  plain,
  children,
}: Readonly<SectionCardProps>) => (
  <Paper withBorder radius="lg" p={0} bg="white" style={{ overflow: 'hidden' }}>
    <Group justify="space-between" align="center" wrap="nowrap" px="lg" py="md" gap="sm">
      <Group gap="sm" wrap="nowrap" align="center" style={{ minWidth: 0 }}>
        {!plain && (
          <ThemeIcon
            size={36}
            radius="md"
            variant="light"
            color="primary"
            style={{ flexShrink: 0 }}
          >
            <CardIcon size={18} stroke={1.8} />
          </ThemeIcon>
        )}
        <div style={{ minWidth: 0 }}>
          <Text
            fw={700}
            fz={label ? 'xs' : 'md'}
            lh={1.3}
            tt={label ? 'uppercase' : undefined}
            style={label ? { letterSpacing: '0.04em' } : undefined}
          >
            {title}
          </Text>
          {subtitle && (
            <Text fz="xs" c="dimmed" fw={label ? 400 : undefined}>
              {subtitle}
            </Text>
          )}
        </div>
      </Group>
      {(count || action) && (
        <Group gap="xs" wrap="nowrap">
          {count && (
            <Text fz="xs" c="dimmed" fw={500}>
              {count}
            </Text>
          )}
          {action}
        </Group>
      )}
    </Group>
    {!plain && <Divider />}
    <Box p={flush ? 0 : 'lg'} pt={plain && !flush ? 0 : undefined}>
      {flush ? children : <Stack gap="md">{children}</Stack>}
    </Box>
  </Paper>
);
