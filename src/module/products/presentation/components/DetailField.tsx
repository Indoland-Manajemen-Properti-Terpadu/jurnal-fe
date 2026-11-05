import type { ReactNode } from 'react';
import { Box, Group, Text } from '@mantine/core';

type DetailFieldProps = { label: string; children: ReactNode; action?: ReactNode };

export function DetailField({ label, children, action }: Readonly<DetailFieldProps>) {
  return (
    <Box miw={0}>
      <Text size="xs" c="dimmed" fw={600}>
        {label}
      </Text>
      <Group gap={4} wrap="nowrap" mt={4}>
        <Text size="sm" fw={600} style={{ overflowWrap: 'anywhere' }}>
          {children || '—'}
        </Text>
        {action}
      </Group>
    </Box>
  );
}
