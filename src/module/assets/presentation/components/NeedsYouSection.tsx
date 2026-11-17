import type { ReactNode } from 'react';
import { Badge, Box, Group, Paper, Text, ThemeIcon, Title } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';

export type NeedsYouSectionProps = {
  id: string;
  icon: Icon;
  color?: string;
  title: string;
  subtitle: string;
  count?: number;
  action?: ReactNode;
  children: ReactNode;
};

/** One group of the hub: icon, title with its count, a plain subtitle, then its rows. */
export function NeedsYouSection({
  id,
  icon: SectionIcon,
  color = 'primary',
  title,
  subtitle,
  count,
  action,
  children,
}: Readonly<NeedsYouSectionProps>) {
  return (
    <Paper
      component="section"
      id={id}
      withBorder
      radius="lg"
      p={{ base: 'md', sm: 'lg' }}
      bg="white"
      aria-labelledby={`${id}-title`}
    >
      <Group justify="space-between" align="flex-start" gap="sm" mb="md" wrap="wrap">
        <Group gap="sm" wrap="nowrap" align="flex-start" miw={0}>
          <ThemeIcon size={38} radius="md" variant="light" color={color}>
            <SectionIcon size={20} stroke={1.8} />
          </ThemeIcon>
          <Box miw={0}>
            <Group gap={8} wrap="nowrap">
              <Title order={3} id={`${id}-title`} fz="md" fw={700} c="dark.9">
                {title}
              </Title>
              {count !== undefined && (
                <Badge size="sm" radius="sm" variant="light" color={color}>
                  {count}
                </Badge>
              )}
            </Group>
            <Text fz="xs" c="dimmed">
              {subtitle}
            </Text>
          </Box>
        </Group>
        {action}
      </Group>
      {children}
    </Paper>
  );
}

export default NeedsYouSection;
