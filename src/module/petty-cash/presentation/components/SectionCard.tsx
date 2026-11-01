import type { ReactNode } from 'react';
import { Group, Paper, Text, ThemeIcon } from '@mantine/core';

interface Props {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}

/** A titled card of a form page (icon, bold title, dimmed subtitle), the unit of a Standard B layout. */
export function SectionCard({ icon, title, subtitle, children }: Readonly<Props>) {
  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Group gap="sm" mb="md" wrap="nowrap">
        <ThemeIcon size={36} radius="md" variant="light" color="primary">
          {icon}
        </ThemeIcon>
        <div>
          <Text fw={700} fz={15}>
            {title}
          </Text>
          <Text fz={12} c="dimmed">
            {subtitle}
          </Text>
        </div>
      </Group>
      {children}
    </Paper>
  );
}
