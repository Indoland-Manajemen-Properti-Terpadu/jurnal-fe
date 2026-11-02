import { Box, Divider, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import type { ReactNode } from 'react';

type SectionCardProps = {
  icon: Icon;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/** Section card: icon orb, bold title, dimmed subtitle, then the content. */
export function SectionCard({
  icon: CardIcon,
  title,
  subtitle,
  children,
}: Readonly<SectionCardProps>) {
  return (
    <Paper withBorder shadow="none" radius="md" p="lg" bg="white" style={{ height: '100%' }}>
      <Stack gap="md">
        <Group gap="sm" wrap="nowrap" align="center">
          <ThemeIcon size={38} radius="md" variant="light" color="primary">
            <CardIcon size={20} />
          </ThemeIcon>
          <Box style={{ minWidth: 0 }}>
            <Text fw={600} fz="md" c="primary.9" lh={1.3}>
              {title}
            </Text>
            {subtitle && (
              <Text fz="xs" c="dimmed" lh={1.4}>
                {subtitle}
              </Text>
            )}
          </Box>
        </Group>
        <Divider color="gray.1" />
        {children}
      </Stack>
    </Paper>
  );
}
