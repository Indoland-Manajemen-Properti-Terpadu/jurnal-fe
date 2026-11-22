import type { ReactNode } from 'react';
import { Group, Paper, Text, ThemeIcon, UnstyledButton } from '@mantine/core';

interface ChoiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

/** One big option of a step ("Pelunasan faktur", "Dari penerimaan"): outlined in the brand blue when chosen. */
export const ChoiceCard = ({
  icon,
  title,
  description,
  selected,
  disabled,
  onSelect,
}: Readonly<ChoiceCardProps>) => (
  <UnstyledButton
    onClick={onSelect}
    disabled={disabled}
    aria-pressed={selected}
    style={{
      display: 'block',
      width: '100%',
      textAlign: 'left',
      opacity: disabled && !selected ? 0.55 : 1,
    }}
  >
    <Paper
      withBorder
      radius="md"
      p="md"
      bg={selected ? 'primary.0' : 'white'}
      style={{
        height: '100%',
        borderColor: selected ? 'var(--mantine-color-primary-6)' : undefined,
        borderWidth: selected ? 2 : 1,
      }}
    >
      <Group gap="md" wrap="nowrap" align="flex-start">
        <ThemeIcon size={36} radius="md" variant="light" color="primary">
          {icon}
        </ThemeIcon>
        <div>
          <Text fw={700} fz="md" lh={1.3}>
            {title}
          </Text>
          <Text fz="xs" c="dimmed">
            {description}
          </Text>
        </div>
      </Group>
    </Paper>
  </UnstyledButton>
);
