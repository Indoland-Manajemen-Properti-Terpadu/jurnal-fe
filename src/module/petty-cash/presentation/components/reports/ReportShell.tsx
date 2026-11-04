import type { ReactNode } from 'react';
import { Skeleton, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';

interface Props {
  title: string;
  hint: string;
  /** Loading and failure, for reports that do not render a table (the table has its own). */
  query?: { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown };
  children: ReactNode;
}

/** The heading every report starts with, so each one explains what it shows before the figures. */
export function ReportShell({ title, hint, query, children }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  return (
    <Stack gap="md">
      <Stack gap={2}>
        <Text fw={600} fz={16} c="dark.9">
          {title}
        </Text>
        <Text size="sm" c="dimmed">
          {hint}
        </Text>
      </Stack>
      {query?.isLoading && <Skeleton height={140} radius="md" />}
      {query?.isError && (
        <QueryErrorState
          title={t('reports.loadFailed')}
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )}
      {!query?.isLoading && !query?.isError && children}
    </Stack>
  );
}

/** A neutral figure tile for a report summary; `emphasis` marks a figure that needs attention. */
export function StatTile({
  label,
  value,
  detail,
  emphasis = false,
}: Readonly<{ label: string; value: string; detail?: string; emphasis?: boolean }>) {
  return (
    <Stack gap={2} p="md" bg="gray.0" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fz={20} fw={700} c={emphasis ? 'orange.8' : 'dark.9'} lh={1.25}>
        {value}
      </Text>
      {detail && (
        <Text size="xs" c="dimmed">
          {detail}
        </Text>
      )}
    </Stack>
  );
}
