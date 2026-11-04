import { useState, type ReactNode } from 'react';
import { Select, Stack, Text } from '@mantine/core';
import { IconWallet } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { ADVANCE_STATUSES, type AdvanceStatus } from '@/module/petty-cash/domain/pettyCashStatus';
import {
  DocumentNumber,
  DocumentTable,
  TwoLine,
} from '@/module/petty-cash/presentation/components/DocumentTable';
import { PettyCashStatusBadge } from '@/module/petty-cash/presentation/components/PettyCashStatusBadge';
import { useAdvances } from '@/module/petty-cash/presentation/hooks/useAdvanceQueries';

const PAGE_SIZE = 10;

interface Props {
  fundId: string;
  /** The create action of this tab, shown beside the count of documents. */
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
    <DocumentTable
      filters={
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
          w={{ base: '100%', sm: 240 }}
        />
      }
      countLabel={results ? t('advances.count', { count: results.totalResults }) : undefined}
      action={action}
      columns={[
        { key: 'number', label: t('advances.columns.number') },
        { key: 'requester', label: t('advances.columns.requester') },
        { key: 'amount', label: t('advances.columns.amount'), numeric: true },
        { key: 'outstanding', label: t('advances.columns.outstanding'), numeric: true },
        { key: 'due', label: t('advances.columns.due') },
        { key: 'status', label: t('advances.columns.status') },
      ]}
      items={results?.items}
      rowKey={(item) => item.id}
      rowLabel={(item) => t('advances.view', { number: item.advanceNumber })}
      onOpen={(item) => onSelect(item.id)}
      cells={(item) => [
        <DocumentNumber key="number" number={item.advanceNumber} />,
        <TwoLine key="requester" primary={item.requester.name} secondary={item.purpose} />,
        formatCurrency(item.amount, false),
        formatCurrency(item.outstandingAmount, false),
        <Stack key="due" gap={0}>
          <Text size="sm">{item.dueAt ? dateFormatV1(item.dueAt) : '-'}</Text>
          {item.isOverdue && (
            <Text size="xs" c="orange.8" fw={600}>
              {t('advances.overdue')}
            </Text>
          )}
        </Stack>,
        <PettyCashStatusBadge key="status" kind="advance" status={item.status} />,
      ]}
      minWidth={760}
      loading={query.isLoading}
      fetching={query.isFetching}
      stale={query.isPlaceholderData}
      error={
        query.isError
          ? { title: t('advances.loadFailed'), error: query.error, onRetry: () => query.refetch() }
          : null
      }
      empty={{
        icon: <IconWallet size={32} />,
        title: t('advances.emptyTitle'),
        description: status ? t('advances.emptyFiltered') : t('advances.emptyDescription'),
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
