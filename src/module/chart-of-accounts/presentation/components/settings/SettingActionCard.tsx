import React from 'react';
import {
  Box,
  Button,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';

export interface SettingActionCardTheme {
  /** Mantine color of the icon badge and, with `buttonColor`, the action button. */
  iconColor: string;
  buttonColor: string;
  selectedBorder: string;
  selectedBg: string;
  selectedShadow: string;
  frameSelected: string;
  frameIdle: string;
  frameBorder: string;
}

interface SettingActionCardProps {
  theme: SettingActionCardTheme;
  selected: boolean;
  image: string;
  imageAlt: string;
  icon: Icon;
  title: string;
  description: string;
  buttonLabel: string;
  onSelect: () => void;
  onStart: () => void;
}

/** One of the three option cards (import, export, reset) of the settings modal. */
export const SettingActionCard: React.FC<SettingActionCardProps> = ({
  theme,
  selected,
  image,
  imageAlt,
  icon: CardIcon,
  title,
  description,
  buttonLabel,
  onSelect,
  onStart,
}) => (
  <UnstyledButton
    onClick={onSelect}
    onDoubleClick={onStart}
    style={{ width: '100%', height: '100%' }}
  >
    <Paper
      withBorder
      radius="lg"
      p="md"
      h="100%"
      style={{
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? theme.selectedBorder : 'var(--mantine-color-gray-3)',
        backgroundColor: selected ? theme.selectedBg : 'white',
        boxShadow: selected
          ? theme.selectedShadow
          : '0 2px 8px color-mix(in srgb, var(--mantine-color-black) 4%, transparent)',
        transform: selected ? 'translateY(-2px)' : undefined,
      }}
    >
      <Stack justify="space-between" h="100%" gap="md">
        <Box>
          {/* Top Vector Illustration Frame */}
          <Box
            style={{
              height: 130,
              width: '100%',
              borderRadius: 12,
              background: selected ? theme.frameSelected : theme.frameIdle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: 14,
              border: theme.frameBorder,
            }}
          >
            <Image
              src={image}
              alt={imageAlt}
              h={90}
              fit="contain"
              style={{
                transition: 'transform 0.3s ease',
                transform: selected ? 'scale(1.06)' : 'scale(1)',
              }}
            />
          </Box>

          <Group gap={6} align="center" mb={4}>
            <ThemeIcon size={24} radius="sm" color={theme.iconColor} variant="light">
              <CardIcon size={14} />
            </ThemeIcon>
            <Text fw={700} size="sm" c="dark.9">
              {title}
            </Text>
          </Group>

          <Text size="xs" c="dimmed" lh={1.45}>
            {description}
          </Text>
        </Box>

        <Button
          variant={selected ? 'filled' : 'light'}
          color={theme.buttonColor}
          size="xs"
          radius="md"
          fullWidth
          rightSection={<IconArrowRight size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
        >
          {buttonLabel}
        </Button>
      </Stack>
    </Paper>
  </UnstyledButton>
);
