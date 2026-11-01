import { useState, type ReactNode } from 'react';
import {
  ActionIcon,
  Anchor,
  Badge,
  Group,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconEye, IconWallet } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { ADVANCE_STATUSES, type AdvanceStatus } from '@/module/petty-cash/domain/pettyCashStatus';
import { PettyCashStatusBadge } from '@/module/petty-cash/presentation/components/PettyCashStatusBadge';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { useAdvances } from '@/module/petty-cash/presentation/hooks/useAdvanceQueries';

const PAGE_SIZE = 10;
const COLUMNS = 7;

interface Props {
  fundId: string;
  action?: ReactNode;
  onSelect: (advanceId: string) => void;
}

/** Employee advances of one fund, newest first. */
export function AdvanceList({ fundId, action, onSelect }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const [status, setStatus] = useState<AdvanceStatus | null>(null);
  const [page, setPage] = useState(1);
  const query = useAdvances({
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
          aria-label={t('advances.statusPlaceholder')}
          placeholder={t('advances.statusPlaceholder')}
          data={ADVANCE_STATUSES.map((value) => ({ value, label: t(`status.advance.${value}`) }))}
          value={status}
          onChange={(value) => {
            setStatus(value as AdvanceStatus | null);
            setPage(1);
          }}
          clearable
          clearButtonProps={{ 'aria-label': t('common.clearFilters') }}
          w={{ base: '100%', sm: 260 }}
        />
        <Group gap="md">
          {results && (
            <Text size="xs" c="dimmed" aria-live="polite">
              {t('advances.count', { count: results.totalResults })}
            </Text>
          )}
          {action}
        </Group>
      </Group>

      {query.isError && (
        <QueryErrorState
          title={t('advances.loadFailed')}
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
        <Table.ScrollContainer minWidth={820}>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>{t('advances.columns.number')}</Table.Th>
                <Table.Th>{t('advances.columns.requester')}</Table.Th>
                <Table.Th ta="right">{t('advances.columns.amount')}</Table.Th>
                <Table.Th ta="right">{t('advances.columns.outstanding')}</Table.Th>
                <Table.Th>{t('advances.columns.due')}</Table.Th>
                <Table.Th>{t('advances.columns.status')}</Table.Th>
                <Table.Th ta="center">{t('advances.columns.action')}</Table.Th>
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
                      icon={<IconWallet size={32} />}
                      title={t('advances.emptyTitle')}
                      description={
                        status ? t('advances.emptyFiltered') : t('advances.emptyDescription')
                      }
                      actionLabel={status ? t('common.clearFilters') : undefined}
                      onAction={status ? () => setStatus(null) : undefined}
                    />
                  </Table.Td>
                </Table.Tr>
              )}
              {results?.items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Anchor
                      component="button"
                      type="button"
                      fw={650}
                      size="sm"
                      onClick={() => onSelect(item.id)}
                    >
                      {item.advanceNumber}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{item.requester.name}</Text>
                    <Text size="xs" c="dimmed" lineClamp={1} maw={220}>
                      {item.purpose}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={650}>
                      {formatCurrency(item.amount, false)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm">{formatCurrency(item.outstandingAmount, false)}</Text>
                  </Table.Td>
                  <Table.Td>
                    {item.dueAt ? dateFormatV1(item.dueAt) : '-'}
                    {item.isOverdue && (
                      <Badge ml={6} color="orange" variant="light" radius="sm" tt="none">
                        {t('advances.overdue')}
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <PettyCashStatusBadge kind="advance" status={item.status} />
                  </Table.Td>
                  <Table.Td ta="center">
                    <ActionIcon
                      variant="subtle"
                      aria-label={t('advances.view', { number: item.advanceNumber })}
                      onClick={() => onSelect(item.id)}
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
