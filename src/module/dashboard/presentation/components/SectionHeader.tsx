import { type ComponentType, type ReactNode } from 'react';
import { Box, Group, Text } from '@mantine/core';
import classes from './dashboard.module.css';

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  right,
}: Readonly<{
  icon: ComponentType<{ size?: number | string }>;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}>) {
  return (
    <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm" mt="xs">
      <Group gap="sm" align="center" wrap="nowrap">
        <Box className={classes.sectionBadge}>
          <Icon size={16} />
        </Box>
        <Box>
          <Text fw={800} fz={16} c="dark.9" lh={1.2}>
            {title}
          </Text>
          {subtitle && (
            <Text size="xs" c="dimmed" mt={2}>
              {subtitle}
            </Text>
          )}
        </Box>
      </Group>
      {right}
    </Group>
  );
}
