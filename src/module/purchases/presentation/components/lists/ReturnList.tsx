import { Table } from '@mantine/core';
import { IconArrowBackUp } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { RETURN_STATUSES } from '@/module/purchases/domain/purchaseStatus';
import { detailPath } from '@/module/purchases/presentation/components/hub/documentPaths';
import {
  AmountCell,
  NumberCell,
  TextCell,
} from '@/module/purchases/presentation/components/lists/cells';
import { ListShell } from '@/module/purchases/presentation/components/shared/ListShell';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { useListState } from '@/module/purchases/presentation/components/shared/useListState';
import { useReturns } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

export const ReturnList = () => {
  const { t, currentLanguage } = useTranslation('purchases');
  const navigate = useNavigate();
  const state = useListState();
  const query = useReturns(state.params);

  return (
    <ListShell
      searchValue={state.searchInput}
      onSearchChange={state.setSearch}
      searchPlaceholder={t('hub.returns.search')}
      statusValue={state.status}
      onStatusChange={state.setStatus}
      statusOptions={RETURN_STATUSES.map((status) => ({
        value: status,
        label: t(`status.${status}`),
      }))}
      columns={[
        { key: 'number', label: t('common.number') },
        { key: 'date', label: t('common.date') },
        { key: 'vendor', label: t('common.vendor'), minWidth: 180 },
        { key: 'reason', label: t('hub.returns.reason'), minWidth: 180 },
        { key: 'status', label: t('common.status') },
        { key: 'amount', label: t('hub.returns.value'), align: 'right' },
      ]}
      rows={query.data?.items}
      getKey={(row) => row.id}
      onRowClick={(row) => navigate(detailPath('return', row.id))}
      renderCells={(row) => (
        <>
          <NumberCell kind="return" id={row.id} number={row.number} />
          <TextCell value={formatDay(row.date, currentLanguage)} />
          <TextCell value={row.vendor.name} maxWidth={260} />
          <TextCell value={row.reason} dimmed maxWidth={300} />
          <Table.Td>
            <StatusBadge status={row.status} />
          </Table.Td>
          <AmountCell value={row.finalAmount} />
        </>
      )}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={query.refetch}
      isFiltered={state.isFiltered}
      onResetFilters={state.reset}
      page={state.page}
      totalPages={query.data?.totalPages ?? 0}
      totalResults={query.data?.totalResults ?? 0}
      onPageChange={state.setPage}
      empty={{
        icon: <IconArrowBackUp size={32} stroke={1.6} />,
        title: t('hub.returns.emptyTitle'),
        description: t('hub.returns.emptyDescription'),
      }}
    />
  );
};
