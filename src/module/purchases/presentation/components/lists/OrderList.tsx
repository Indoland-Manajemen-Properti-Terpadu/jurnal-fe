import { Table } from '@mantine/core';
import { IconPackage } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { viewAction } from '@/module/purchases/presentation/components/lists/rowActions';
import { ORDER_STATUSES } from '@/module/purchases/domain/purchaseStatus';
import { detailPath } from '@/module/purchases/presentation/components/hub/documentPaths';
import {
  AmountCell,
  NumberCell,
  TextCell,
} from '@/module/purchases/presentation/components/lists/cells';
import { ListShell } from '@/module/purchases/presentation/components/shared/ListShell';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { orderStatusLabelKey } from '@/module/purchases/presentation/components/orders/orderStatusLabel';
import { useListState } from '@/module/purchases/presentation/components/shared/useListState';
import { useOrders } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

export const OrderList = () => {
  const { t, currentLanguage } = useTranslation('purchases');
  const navigate = useNavigate();
  const state = useListState();
  const query = useOrders(state.params);

  return (
    <ListShell
      searchValue={state.searchInput}
      onSearchChange={state.setSearch}
      searchPlaceholder={t('hub.orders.search')}
      statusValue={state.status}
      onStatusChange={state.setStatus}
      statusOptions={ORDER_STATUSES.map((status) => ({
        value: status,
        label:
          status === 'PARTIAL_RECEIVED' || status === 'RECEIVED' || status === 'COMPLETED'
            ? t(`hub.orders.statusFilters.${status}`)
            : t(`status.${status}`),
      }))}
      columns={[
        { key: 'number', label: t('hub.orders.colOrder') },
        { key: 'vendor', label: t('common.vendor'), minWidth: 180 },
        { key: 'expected', label: t('hub.orders.expected') },
        { key: 'status', label: t('common.status') },
        { key: 'amount', label: t('hub.orders.value'), align: 'right' },
        { key: 'payable', label: t('hub.orders.payable'), align: 'right' },
      ]}
      rows={query.data?.items}
      getKey={(row) => row.id}
      onRowClick={(row) => navigate(detailPath('order', row.id))}
      renderCells={(row) => (
        <>
          <NumberCell
            kind="order"
            id={row.id}
            number={row.number}
            sub={`${row.documentLabel} · ${formatDay(row.date, currentLanguage)}`}
          />
          <TextCell value={row.vendor.name} maxWidth={260} />
          <TextCell value={formatDay(row.expectedDate, currentLanguage)} dimmed />
          <Table.Td>
            <StatusBadge
              status={row.status}
              label={row.statusLabel}
              englishLabel={
                orderStatusLabelKey(row.status, row.isService)
                  ? t(orderStatusLabelKey(row.status, row.isService) as string)
                  : undefined
              }
            />
          </Table.Td>
          <AmountCell value={row.finalAmount} />
          <AmountCell value={row.payableAmount} dimmed={row.payableAmount === 0} />
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
      noun={t('list.nouns.order')}
      limit={state.limit}
      onLimitChange={state.setLimit}
      rowActions={(row) => [
        viewAction(t('list.view'), () => navigate(detailPath('order', row.id))),
      ]}
      empty={{
        icon: <IconPackage size={32} stroke={1.6} />,
        title: t('hub.orders.emptyTitle'),
        description: t('hub.orders.emptyDescription'),
      }}
    />
  );
};
