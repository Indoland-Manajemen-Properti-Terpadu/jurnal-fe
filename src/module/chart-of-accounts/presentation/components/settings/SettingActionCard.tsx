import React from 'react';
import { Button, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import { SettingHero } from './SettingHero';
import { SETTING_TONES, type SettingTone } from './settingActionThemes';
import classes from './SettingModals.module.css';

interface SettingActionCardProps {
  tone: Exclude<SettingTone, 'done'>;
  icon: Icon;
  title: string;
  description: string;
  meta: string;
  buttonLabel: string;
  onStart: () => void;
}

/** One option (import, export, reset) of the settings modal; its button starts the flow directly. */
export const SettingActionCard: React.FC<SettingActionCardProps> = ({
  tone,
  icon: CardIcon,
  title,
  description,
  meta,
  buttonLabel,
  onStart,
}) => {
  const { color } = SETTING_TONES[tone];
  return (
    <Paper withBorder radius="lg" p="md" bg="white" className={classes.card}>
      <SettingHero tone={tone} height={128} />
      <Stack gap="xs" mt="md" style={{ flex: 1 }}>
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon size={28} radius="md" color={color} variant="light">
            <CardIcon size={16} />
          </ThemeIcon>
          <Text fw={700} fz="sm" c="dark.9">
            {title}
          </Text>
        </Group>
        <Text fz="sm" c="dimmed" lh={1.5}>
          {description}
        </Text>
        <Text fz="xs" c="gray.7" fw={500} mt="auto">
          {meta}
        </Text>
      </Stack>
      <Button
        variant="light"
        color={color}
        radius="md"
        fullWidth
        mt="md"
        rightSection={<IconArrowRight size={16} />}
        onClick={onStart}
      >
        {buttonLabel}
      </Button>
    </Paper>
  );
};
