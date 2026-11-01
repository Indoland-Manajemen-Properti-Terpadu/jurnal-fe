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
import { IconCash, IconEye } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import {
  REIMBURSEMENT_STATUSES,
  type ReimbursementStatus,
} from '@/module/petty-cash/domain/pettyCashStatus';
import { PettyCashStatusBadge } from '@/module/petty-cash/presentation/components/PettyCashStatusBadge';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { useReimbursements } from '@/module/petty-cash/presentation/hooks/useReplenishmentQueries';

const PAGE_SIZE = 10;
const COLUMNS = 6;

interface Props {
  fundId: string;
  /** The create action of this tab, shown beside the count of documents. */
  action?: ReactNode;
  onSelect: (replenishmentId: string) => void;
}

/** Replenishments of one fund, newest first. */
export function ReplenishmentList({ fundId, action, onSelect }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const [status, setStatus] = useState<ReimbursementStatus | null>(null);
  const [page, setPage] = useState(1);
  const query = useReimbursements({
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
          aria-label={t('replenishments.statusPlaceholder')}
          placeholder={t('replenishments.statusPlaceholder')}
          data={REIMBURSEMENT_STATUSES.map((value) => ({
            value,
            label: t(`status.reimbursement.${value}`),
          }))}
          value={status}
          onChange={(value) => {
            setStatus(value as ReimbursementStatus | null);
            setPage(1);
          }}
          clearable
          clearButtonProps={{ 'aria-label': t('common.clearFilters') }}
          w={{ base: '100%', sm: 260 }}
        />
        <Group gap="md">
          {results && (
            <Text size="xs" c="dimmed" aria-live="polite">
              {t('replenishments.count', { count: results.totalResults })}
            </Text>
          )}
          {action}
        </Group>
      </Group>

      {query.isError && (
        <QueryErrorState
          title={t('replenishments.loadFailed')}
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
        <Table.ScrollContainer minWidth={700}>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>{t('replenishments.columns.number')}</Table.Th>
                <Table.Th>{t('replenishments.columns.date')}</Table.Th>
                <Table.Th>{t('replenishments.columns.vouchers')}</Table.Th>
                <Table.Th ta="right">{t('replenishments.columns.total')}</Table.Th>
                <Table.Th>{t('replenishments.columns.status')}</Table.Th>
                <Table.Th ta="center">{t('replenishments.columns.action')}</Table.Th>
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
                      icon={<IconCash size={32} />}
                      title={t('replenishments.emptyTitle')}
                      description={
                        status
                          ? t('replenishments.emptyFiltered')
                          : t('replenishments.emptyDescription')
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
                      {item.reimbursementNumber}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>{dateFormatV1(item.requestDate)}</Table.Td>
                  <Table.Td>
                    {t('replenishments.voucherCount', { count: item.items.length })}
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={650}>
                      {formatCurrency(item.totalAmount, false)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <PettyCashStatusBadge kind="reimbursement" status={item.status} />
                  </Table.Td>
                  <Table.Td ta="center">
                    <ActionIcon
                      variant="subtle"
                      aria-label={t('replenishments.view', { number: item.reimbursementNumber })}
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
