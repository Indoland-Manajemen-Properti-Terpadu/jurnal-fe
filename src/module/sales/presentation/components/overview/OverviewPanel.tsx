import type { ReactNode } from 'react';
import { Box, Group, Paper, Stack, Text } from '@mantine/core';

interface OverviewPanelProps {
  title: string;
  caption?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function OverviewPanel({ title, caption, action, children }: Readonly<OverviewPanelProps>) {
  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
      <Group justify="space-between" align="flex-start" gap="md" wrap="nowrap">
        <Stack gap={4} style={{ minWidth: 0 }}>
          <Text fw={700}>{title}</Text>
          {caption && (
            <Text size="xs" c="dimmed">
              {caption}
            </Text>
          )}
        </Stack>
        {action && <Box>{action}</Box>}
      </Group>
      <Box mt="md">{children}</Box>
    </Paper>
  );
}
