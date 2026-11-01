import { Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import type { ReactNode } from 'react';

type Props = {
  icon: Icon;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/** Standard B section card: icon orb, bold title, dimmed subtitle, then the fields. */
export function FormCard({ icon: CardIcon, title, subtitle, children }: Readonly<Props>) {
  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Stack gap="md">
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <ThemeIcon size={36} radius="md" variant="light" color="primary">
            <CardIcon size={20} />
          </ThemeIcon>
          <div>
            <Text fw={600} fz={15}>
              {title}
            </Text>
            {subtitle && (
              <Text fz={12} c="dimmed">
                {subtitle}
              </Text>
            )}
          </div>
        </Group>
        {children}
      </Stack>
    </Paper>
  );
}
