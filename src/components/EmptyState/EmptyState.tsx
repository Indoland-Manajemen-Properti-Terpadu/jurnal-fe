import React from 'react';
import { Stack, Text, ThemeIcon, Button, Group } from '@mantine/core';
import { IconDatabaseOff } from '@tabler/icons-react';

export interface EmptyStateProps {
  /**
   * Main title of the empty state
   * @default 'Belum Ada Data'
   */
  title?: string;
  /**
   * Descriptive subtitle explaining why data is empty or guiding what action to take
   */
  description?: string;
  /**
   * Custom icon element or tabler icon component
   */
  icon?: React.ReactNode;
  /**
   * Action button label (e.g. 'Tambah Data Baru' or 'Reset Filter')
   */
  actionLabel?: string;
  /**
   * Action button callback
   */
  onAction?: () => void;
  /**
   * Left section icon for the action button
   */
  actionIcon?: React.ReactNode;
  /**
   * Color theme for icon & accents
   * @default 'primary'
   */
  color?: string;
  /**
   * Vertical padding
   * @default 48
   */
  py?: number | string;
  /**
   * Max width for description
   * @default 420
   */
  maw?: number | string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Belum Ada Data',
  description = 'Tidak ada data yang cocok dengan kriteria filter atau pencarian Anda.',
  icon,
  actionLabel,
  onAction,
  actionIcon,
  color = 'primary',
  py = 52,
  maw = 420,
}) => {
  return (
    <Stack align="center" justify="center" gap="xs" py={py} px="md">
      <ThemeIcon
        size={64}
        radius="xl"
        variant="light"
        color={color}
        style={{
          boxShadow:
            '0 8px 20px color-mix(in srgb, var(--mantine-color-primary-6) 8%, transparent)',
          marginBottom: 4,
        }}
      >
        {icon ?? <IconDatabaseOff size={32} stroke={1.6} />}
      </ThemeIcon>

      <Text fw={600} size="md" c="dark.8" ta="center">
        {title}
      </Text>

      {description && (
        <Text size="sm" c="dimmed" ta="center" maw={maw} lh={1.55}>
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Group mt="xs">
          <Button
            size="xs"
            variant="light"
            color={color}
            radius="md"
            leftSection={actionIcon}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </Group>
      )}
    </Stack>
  );
};

export default EmptyState;
