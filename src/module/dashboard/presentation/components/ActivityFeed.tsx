import { type ComponentType } from 'react';
import { Box, Group, ScrollArea, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconEdit, IconFilePlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AuditLogEntry } from '@/module/dashboard/domain/dashboardTypes';
import classes from './dashboard.module.css';
import { EmptyHint } from './EmptyHint';
import { timeFmtEn, timeFmtId } from './dashboardFormat';

/* ---------- Activity Feed ---------- */

export function ActivityFeed({
  items,
  loading,
  onOpen,
}: Readonly<{
  items: AuditLogEntry[];
  loading?: boolean;
  onOpen?: (a: AuditLogEntry) => void;
}>) {
  const { t, currentLanguage } = useTranslation('dashboard');

  const actionMeta: Record<
    string,
    { color: string; label: string; icon: ComponentType<{ size?: number | string }> }
  > = {
    CREATE: { color: 'teal', label: t('actionCreate'), icon: IconFilePlus },
    UPDATE: { color: 'blue', label: t('actionUpdate'), icon: IconEdit },
    DELETE: { color: 'red', label: t('actionDelete'), icon: IconTrash },
  };

  if (loading) {
    return (
      <Stack gap="xs">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} h={42} radius="md" />
        ))}
      </Stack>
    );
  }
  if (items.length === 0) return <EmptyHint text={t('activityEmpty')} />;
  const timeFormatter = currentLanguage === 'en' ? timeFmtEn : timeFmtId;

  return (
    <ScrollArea.Autosize mah={320} type="auto">
      <Stack gap={0}>
        {items.slice(0, 12).map((a, idx, arr) => {
          const meta = actionMeta[a.action] ?? {
            color: 'gray',
            label: a.action.toLowerCase(),
            icon: IconEdit,
          };
          const Icon = meta.icon;
          return (
            <Group
              key={a.id}
              gap="sm"
              wrap="nowrap"
              align="flex-start"
              className={classes.rowHover}
              p="xs"
              onClick={() => a.action !== 'DELETE' && onOpen?.(a)}
            >
              <Stack gap={0} align="center">
                <ThemeIcon size={28} radius="xl" variant="light" color={meta.color}>
                  <Icon size={14} />
                </ThemeIcon>
                {idx < arr.length - 1 && <Box w={2} h={18} bg="gray.2" mt={4} />}
              </Stack>
              <Box style={{ minWidth: 0 }}>
                <Text size="sm" c="dark.8" lh={1.35}>
                  <Text span fw={700}>
                    {a.performedBy}
                  </Text>{' '}
                  {meta.label}{' '}
                  <Text span ff="monospace" fw={700} c="primary.7">
                    #{a.transactionNumber ?? '—'}
                  </Text>
                </Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {a.createdAt ? timeFormatter.format(new Date(a.createdAt)) : '—'}
                </Text>
              </Box>
            </Group>
          );
        })}
      </Stack>
    </ScrollArea.Autosize>
  );
}
