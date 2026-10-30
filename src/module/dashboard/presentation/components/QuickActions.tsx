import { type ComponentType } from 'react';
import { Group, SimpleGrid, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconArrowUpRight } from '@tabler/icons-react';
import classes from './dashboard.module.css';
import { IconOrb } from './IconOrb';

/* ---------- Quick Actions ---------- */

export type QuickAction = {
  label: string;
  icon: ComponentType<{ size?: number | string }>;
  tone: string;
  onClick: () => void;
};

export function QuickActions({ actions }: Readonly<{ actions: QuickAction[] }>) {
  return (
    <SimpleGrid cols={2} spacing="xs">
      {actions.map((a) => (
        <UnstyledButton
          key={a.label}
          onClick={a.onClick}
          className={classes.rowHover}
          p="sm"
          style={{
            borderRadius: 14,
            border: '1px solid rgba(15, 23, 42, 0.07)',
            backgroundColor: 'rgba(255, 255, 255, 0.72)',
          }}
        >
          <Stack gap={8}>
            <IconOrb icon={a.icon} tone={a.tone} />
            <Group justify="space-between" wrap="nowrap" gap={4}>
              <Text size="xs" fw={700} c="dark.8" truncate>
                {a.label}
              </Text>
              <IconArrowUpRight size={13} color="var(--mantine-color-gray-5)" />
            </Group>
          </Stack>
        </UnstyledButton>
      ))}
    </SimpleGrid>
  );
}
