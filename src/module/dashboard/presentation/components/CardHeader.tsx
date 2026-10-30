import { type ReactNode } from 'react';
import { Box, Group, Text } from '@mantine/core';

export function CardHeader({
  title,
  subtitle,
  right,
}: Readonly<{ title: string; subtitle?: string; right?: ReactNode }>) {
  return (
    <Group justify="space-between" align="flex-start" mb="md" wrap="nowrap" gap="sm">
      <Box style={{ minWidth: 0 }}>
        <Text fw={700} fz={15} c="dark.9" lh={1.25}>
          {title}
        </Text>
        {subtitle && (
          <Text size="xs" c="dimmed" mt={3} lh={1.4}>
            {subtitle}
          </Text>
        )}
      </Box>
      {right && <Box style={{ flexShrink: 0 }}>{right}</Box>}
    </Group>
  );
}
