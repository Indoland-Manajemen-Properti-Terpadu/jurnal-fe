import type { ReactNode } from 'react';
import { Group, Paper, Stack, Text } from '@mantine/core';
import {
  Illustration,
  type IllustrationName,
} from '@/module/bank-connection/presentation/components/Illustration';

/** A calm card for one state of a connection: an illustration, a title, a sentence, then the one next step. */
export function MessagePanel({
  illustration,
  title,
  body,
  badge,
  children,
  actions,
}: Readonly<{
  illustration: IllustrationName;
  title: string;
  body: string;
  badge?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}>) {
  return (
    <Paper withBorder radius="md" p="xl" bg="white">
      <Group gap="xl" align="center" wrap="wrap">
        <div style={{ flex: '0 0 160px', maxWidth: '100%' }}>
          <Illustration name={illustration} maxWidth={160} />
        </div>
        <Stack gap="sm" style={{ flex: '1 1 280px', minWidth: 0 }}>
          {badge}
          <Text component="h2" fz={18} fw={700} c="dark.9" m={0}>
            {title}
          </Text>
          <Text c="dimmed" fz="sm">
            {body}
          </Text>
          {children}
          {actions && <Group gap="sm">{actions}</Group>}
        </Stack>
      </Group>
    </Paper>
  );
}
