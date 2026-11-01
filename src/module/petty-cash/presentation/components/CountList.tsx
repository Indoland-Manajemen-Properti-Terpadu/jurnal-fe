import { useState, type ReactNode } from 'react';
import {
  ActionIcon,
  Anchor,
  Group,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconEye, IconScale } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { COUNT_STATUSES, type CountStatus } from '@/module/petty-cash/domain/pettyCashStatus';
import { PettyCashStatusBadge } from '@/module/petty-cash/presentation/components/PettyCashStatusBadge';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { VarianceText } from '@/module/petty-cash/presentation/components/VarianceText';
import { useCounts } from '@/module/petty-cash/presentation/hooks/useCountQueries';

const PAGE_SIZE = 10;
const COLUMNS = 7;

interface Props {
  fundId: string;
  /** The create action of this tab, shown beside the count of documents. */
  action?: ReactNode;
  onSelect: (countId: string) => void;
}

/** Cash counts of one fund, newest first. */
export function CountList({ fundId, action, onSelect }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const [status, setStatus] = useState<CountStatus | null>(null);
  const [page, setPage] = useState(1);
  const query = useCounts({
    fundId,
    status: status ? [status] : undefined,
    page,
    limit: PAGE_SIZE,
  });
  const results = query.data;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" gap="sm" wrap="wrap">
        <Select
          aria-label={t('counts.statusPlaceholder')}
          placeholder={t('counts.statusPlaceholder')}
          data={COUNT_STATUSES.map((value) => ({ value, label: t(`status.count.${value}`) }))}
          value={status}
          onChange={(value) => {
            setStatus(value as CountStatus | null);
            setPage(1);
          }}
          clearable
          clearButtonProps={{ 'aria-label': t('common.clearFilters') }}
          w={{ base: '100%', sm: 260 }}
        />
        <Group gap="md">
          {results && (
            <Text size="xs" c="dimmed" aria-live="polite">
              {t('counts.count', { count: results.totalResults })}
            </Text>
          )}
          {action}
        </Group>
      </Group>

      {query.isError && (
        <QueryErrorState
          title={t('counts.loadFailed')}
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )}

      <Paper
        withBorder
        radius="md"
        bg="white"
        aria-busy={query.isFetching}
        style={{
          overflow: 'hidden',
          opacity: query.isPlaceholderData ? 0.55 : 1,
          transition: 'opacity 150ms ease',
        }}
      >
        <Table.ScrollContainer minWidth={760}>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>{t('counts.columns.number')}</Table.Th>
                <Table.Th>{t('counts.columns.date')}</Table.Th>
                <Table.Th>{t('counts.columns.counter')}</Table.Th>
                <Table.Th ta="right">{t('counts.columns.counted')}</Table.Th>
                <Table.Th>{t('counts.columns.variance')}</Table.Th>
                <Table.Th>{t('counts.columns.status')}</Table.Th>
                <Table.Th ta="center">{t('counts.columns.action')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {query.isLoading &&
                Array.from({ length: 4 }, (_, index) => (
                  <Table.Tr key={`loading-${index}`}>
                    <Table.Td colSpan={COLUMNS}>
                      <Skeleton height={20} radius="sm" />
                    </Table.Td>
                  </Table.Tr>
                ))}
              {results?.items.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={COLUMNS}>
                    <EmptyState
                      icon={<IconScale size={32} />}
                      title={t('counts.emptyTitle')}
                      description={
                        status ? t('counts.emptyFiltered') : t('counts.emptyDescription')
                      }
                      actionLabel={status ? t('common.clearFilters') : undefined}
                      onAction={status ? () => setStatus(null) : undefined}
                    />
                  </Table.Td>
                </Table.Tr>
              )}
              {results?.items.map((count) => (
                <Table.Tr key={count.id}>
                  <Table.Td>
                    <Anchor
                      component="button"
                      type="button"
                      fw={650}
                      size="sm"
                      onClick={() => onSelect(count.id)}
                    >
                      {count.countNumber}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>{dateFormatV1(count.countedAt)}</Table.Td>
                  <Table.Td>{count.countedBy?.name}</Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={650}>
                      {formatCurrency(count.totalPhysicalCash, false)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <VarianceText type={count.varianceType} amount={count.varianceAmount} />
                  </Table.Td>
                  <Table.Td>
                    <PettyCashStatusBadge kind="count" status={count.status} />
                  </Table.Td>
                  <Table.Td ta="center">
                    <ActionIcon
                      variant="subtle"
                      aria-label={t('counts.view', { number: count.countNumber })}
                      onClick={() => onSelect(count.id)}
                    >
                      <IconEye size={18} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {results && results.totalPages > 1 && (
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            {t('common.page')} {results.page} {t('common.of')} {results.totalPages}
          </Text>
          <Pagination value={page} onChange={setPage} total={results.totalPages} size="sm" />
        </Group>
      )}
    </Stack>
  );
}
