import React from 'react';
import { Button, Paper, Stack, Text } from '@mantine/core';
import { SettingHero } from './SettingHero';

interface SettingDoneViewProps {
  title: string;
  description: string;
  /** A number with its label, shown as a tile (for example the imported accounts). */
  stat?: { value: number; label: string };
  closeLabel: string;
  onClose: () => void;
}

/** Last step of every setting flow: confirmation, what it means, and one way out. */
export const SettingDoneView: React.FC<SettingDoneViewProps> = ({
  title,
  description,
  stat,
  closeLabel,
  onClose,
}) => (
  <Stack gap="md" align="center" mt="xs">
    <SettingHero tone="done" height={148} />
    <Stack gap={4} align="center" ta="center" maw={420}>
      <Text fw={700} fz="lg" c="dark.9" role="status">
        {title}
      </Text>
      <Text fz="sm" c="dimmed">
        {description}
      </Text>
    </Stack>
    {stat && (
      <Paper withBorder radius="md" px="xl" py="sm" bg="green.0" ta="center">
        <Text fw={700} fz="2xl" c="green.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {stat.value}
        </Text>
        <Text fz="xs" c="green.9">
          {stat.label}
        </Text>
      </Paper>
    )}
    <Button color="primary" radius="md" onClick={onClose} mt="xs" miw={160}>
      {closeLabel}
    </Button>
  </Stack>
);
