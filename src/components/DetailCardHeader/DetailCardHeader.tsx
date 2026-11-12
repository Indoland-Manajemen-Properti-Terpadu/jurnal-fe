import { Group, Text, ThemeIcon, Title } from '@mantine/core';
import type { ReactNode } from 'react';

type DetailCardHeaderProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  /** Optional control on the right, such as a button; never an icon standing alone. */
  action?: ReactNode;
};

/** The one header of every card on the detail page: icon first, then title and a short line. */
export function DetailCardHeader({
  icon,
  title,
  subtitle,
  action,
}: Readonly<DetailCardHeaderProps>) {
  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap" mb="md" gap="sm">
      <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
        <ThemeIcon size={36} radius="md" color="primary" variant="light" style={{ flexShrink: 0 }}>
          {icon}
        </ThemeIcon>
        <div style={{ minWidth: 0 }}>
          <Title order={3} size="md" lh={1.3}>
            {title}
          </Title>
          {subtitle && (
            <Text size="xs" c="dimmed" mt={2}>
              {subtitle}
            </Text>
          )}
        </div>
      </Group>
      {action}
    </Group>
  );
}

export default DetailCardHeader;
