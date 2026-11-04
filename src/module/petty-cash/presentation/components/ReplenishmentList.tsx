import { useState, type ReactNode } from 'react';
import { Select, Stack } from '@mantine/core';
import { IconCash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import {
  REIMBURSEMENT_STATUSES,
  type ReimbursementStatus,
} from '@/module/petty-cash/domain/pettyCashStatus';
import { ApprovalProgress } from '@/module/petty-cash/presentation/components/ApprovalProgress';
import {
  DocumentNumber,
  DocumentTable,
} from '@/module/petty-cash/presentation/components/DocumentTable';
import { PettyCashStatusBadge } from '@/module/petty-cash/presentation/components/PettyCashStatusBadge';
import { useReimbursements } from '@/module/petty-cash/presentation/hooks/useReplenishmentQueries';

const PAGE_SIZE = 10;

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
    <DocumentTable
      filters={
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
          w={{ base: '100%', sm: 240 }}
        />
      }
      countLabel={results ? t('replenishments.count', { count: results.totalResults }) : undefined}
      action={action}
      columns={[
        { key: 'number', label: t('replenishments.columns.number') },
        { key: 'date', label: t('replenishments.columns.date') },
        { key: 'vouchers', label: t('replenishments.columns.vouchers') },
        { key: 'total', label: t('replenishments.columns.total'), numeric: true },
        { key: 'status', label: t('replenishments.columns.status') },
      ]}
      items={results?.items}
      rowKey={(item) => item.id}
      rowLabel={(item) => t('replenishments.view', { number: item.reimbursementNumber })}
      onOpen={(item) => onSelect(item.id)}
      cells={(item) => [
        <DocumentNumber key="number" number={item.reimbursementNumber} />,
        dateFormatV1(item.requestDate),
        t('replenishments.voucherCount', { count: item.items.length }),
        formatCurrency(item.totalAmount, false),
        <Stack key="status" gap={0} align="flex-start">
          <PettyCashStatusBadge kind="reimbursement" status={item.status} />
          {item.status === 'SUBMITTED' && <ApprovalProgress pending={item.pendingApprovers} />}
        </Stack>,
      ]}
      minWidth={680}
      loading={query.isLoading}
      fetching={query.isFetching}
      stale={query.isPlaceholderData}
      error={
        query.isError
          ? {
              title: t('replenishments.loadFailed'),
              error: query.error,
              onRetry: () => query.refetch(),
            }
          : null
      }
      empty={{
        icon: <IconCash size={32} />,
        title: t('replenishments.emptyTitle'),
        description: status
          ? t('replenishments.emptyFiltered')
          : t('replenishments.emptyDescription'),
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
