import type { ReactNode } from 'react';
import { Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** One step of the closing: a numbered orb, a bold title, a dimmed line, then its content. */
export function StepCard({ step, title, description, actions, children }: Readonly<StepCardProps>) {
  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Group gap="sm" wrap="nowrap" align="flex-start">
            <ThemeIcon size={36} radius="xl" variant="light" color="primary">
              <Text fw={700} size="sm">
                {step}
              </Text>
            </ThemeIcon>
            <div>
              <Text fw={700} fz="md">
                {title}
              </Text>
              <Text fz="xs" c="dimmed">
                {description}
              </Text>
            </div>
          </Group>
          {actions}
        </Group>
        {children}
      </Stack>
    </Paper>
  );
}
