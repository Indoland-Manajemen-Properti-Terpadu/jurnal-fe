import { useState, type ReactNode } from 'react';
import { Select, Stack } from '@mantine/core';
import { IconScale } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { COUNT_STATUSES, type CountStatus } from '@/module/petty-cash/domain/pettyCashStatus';
import { ApprovalProgress } from '@/module/petty-cash/presentation/components/ApprovalProgress';
import {
  DocumentNumber,
  DocumentTable,
} from '@/module/petty-cash/presentation/components/DocumentTable';
import { PettyCashStatusBadge } from '@/module/petty-cash/presentation/components/PettyCashStatusBadge';
import { VarianceText } from '@/module/petty-cash/presentation/components/VarianceText';
import { useCounts } from '@/module/petty-cash/presentation/hooks/useCountQueries';

const PAGE_SIZE = 10;

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
    <DocumentTable
      filters={
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
          w={{ base: '100%', sm: 240 }}
        />
      }
      countLabel={results ? t('counts.count', { count: results.totalResults }) : undefined}
      action={action}
      columns={[
        { key: 'number', label: t('counts.columns.number') },
        { key: 'date', label: t('counts.columns.date') },
        { key: 'counter', label: t('counts.columns.counter') },
        { key: 'counted', label: t('counts.columns.counted'), numeric: true },
        { key: 'variance', label: t('counts.columns.variance'), numeric: true },
        { key: 'status', label: t('counts.columns.status') },
      ]}
      items={results?.items}
      rowKey={(count) => count.id}
      rowLabel={(count) => t('counts.view', { number: count.countNumber })}
      onOpen={(count) => onSelect(count.id)}
      cells={(count) => [
        <DocumentNumber key="number" number={count.countNumber} />,
        dateFormatV1(count.countedAt),
        count.countedBy?.name ?? '-',
        formatCurrency(count.totalCounted, false),
        <VarianceText key="variance" type={count.varianceType} amount={count.varianceAmount} />,
        <Stack key="status" gap={0} align="flex-start">
          <PettyCashStatusBadge kind="count" status={count.status} />
          {count.status === 'SUBMITTED' && <ApprovalProgress pending={count.pendingApprovers} />}
        </Stack>,
      ]}
      minWidth={720}
      loading={query.isLoading}
      fetching={query.isFetching}
      stale={query.isPlaceholderData}
      error={
        query.isError
          ? { title: t('counts.loadFailed'), error: query.error, onRetry: () => query.refetch() }
          : null
      }
      empty={{
        icon: <IconScale size={32} />,
        title: t('counts.emptyTitle'),
        description: status ? t('counts.emptyFiltered') : t('counts.emptyDescription'),
        actionLabel: status ? t('common.clearFilters') : undefined,
        onAction: status ? () => setStatus(null) : undefined,
      }}
      pagination={
        results && {
          page,
          totalPages: results.totalPages,
          totalResults: results.totalResults,
          limit: PAGE_SIZE,
          onChange: setPage,
        }
      }
    />
  );
}
