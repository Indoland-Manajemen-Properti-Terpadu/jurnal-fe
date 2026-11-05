import React from 'react';
import { Group, Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import { SETTING_TONES, type SettingTone } from './settingActionThemes';

interface SettingModalHeaderProps {
  tone: SettingTone;
  icon: Icon;
  title: string;
  subtitle: string;
}

/** Title block of a setting modal: icon tile in the tone of the option, title and one line of context. */
export const SettingModalHeader: React.FC<SettingModalHeaderProps> = ({
  tone,
  icon: HeaderIcon,
  title,
  subtitle,
}) => (
  <Group gap="sm" wrap="nowrap">
    <ThemeIcon size={40} radius="md" color={SETTING_TONES[tone].color} variant="light">
      <HeaderIcon size={22} stroke={1.8} />
    </ThemeIcon>
    <div>
      <Text fw={700} fz="md" c="dark.9" lh={1.25}>
        {title}
      </Text>
      <Text fz="xs" c="dimmed">
        {subtitle}
      </Text>
    </div>
  </Group>
);
