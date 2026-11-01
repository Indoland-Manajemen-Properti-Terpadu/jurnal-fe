import type { ReactNode } from 'react';
import { Skeleton, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';

interface Props {
  hint: string;
  query: { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown };
  /** Filters shown above the report. */
  controls?: ReactNode;
  children: ReactNode;
}

/** Hint, filters, and the shared loading and failure states of every report. */
export function ReportShell({ hint, query, controls, children }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        {hint}
      </Text>
      {controls}
      {query.isLoading && <Skeleton height={140} radius="md" />}
      {query.isError && (
        <QueryErrorState
          title={t('reports.loadFailed')}
          error={query.error as never}
          onRetry={() => query.refetch()}
        />
      )}
      {!query.isLoading && !query.isError && children}
    </Stack>
  );
}
