import type { ReactNode } from 'react';
import { Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';

interface SectionCardProps {
  icon: Icon;
  title: string;
  subtitle?: string;
  /** Right-aligned control in the card header. */
  action?: ReactNode;
  children: ReactNode;
}

/** A titled card of a form or detail page: icon orb, title and a dimmed subtitle (Standard B). */
export const SectionCard = ({
  icon: CardIcon,
  title,
  subtitle,
  action,
  children,
}: Readonly<SectionCardProps>) => (
  <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
    <Stack gap="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" align="center">
          <ThemeIcon size={36} radius="md" variant="light" color="primary">
            <CardIcon size={18} stroke={1.8} />
          </ThemeIcon>
          <div>
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
        {action && <div style={{ alignSelf: 'center' }}>{action}</div>}
      </Group>
      {children}
    </Stack>
  </Paper>
);
