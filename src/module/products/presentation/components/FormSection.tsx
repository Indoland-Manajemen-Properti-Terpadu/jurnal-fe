import type { ReactNode } from 'react';
import { Box, Group, Paper, Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';

type FormSectionProps = {
  icon: Icon;
  title: string;
  description: string;
  toggle?: ReactNode;
  children: ReactNode;
};

export function FormSection({
  icon: SectionIcon,
  title,
  description,
  toggle,
  children,
}: Readonly<FormSectionProps>) {
  return (
    <Paper withBorder radius="md" p="md" bg="white">
      <Group justify="space-between" align="center" wrap="nowrap" gap="md">
        <Group align="center" gap="xs" wrap="nowrap">
          <ThemeIcon variant="light" color="primary" radius="sm" size={32}>
            <SectionIcon size={16} />
          </ThemeIcon>
          <Box>
            <Text fw={600} size="sm" c="primary.9" lh={1.3}>
              {title}
            </Text>
            <Text size="xs" c="dimmed" lh={1.3}>
              {description}
            </Text>
          </Box>
        </Group>
        {toggle}
      </Group>
      {children}
    </Paper>
  );
}
