import type { ReactNode } from 'react';
import { Box, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';

/** One card of a posting form: an icon, a title with a one line hint, an optional action, then the fields. */
export function FormSection({
  icon,
  title,
  hint,
  action,
  children,
}: Readonly<{
  icon: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}>) {
  return (
    <Paper withBorder radius="md" p="lg" bg="white">
      <Stack gap="md">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon size={36} radius="md" variant="light" color="primary">
              {icon}
            </ThemeIcon>
            <Box>
              <Text fw={700} fz={15} c="dark.9">
                {title}
              </Text>
              {hint && (
                <Text fz={12} c="dimmed">
                  {hint}
                </Text>
              )}
            </Box>
          </Group>
          {action}
        </Group>
        {children}
      </Stack>
    </Paper>
  );
}
