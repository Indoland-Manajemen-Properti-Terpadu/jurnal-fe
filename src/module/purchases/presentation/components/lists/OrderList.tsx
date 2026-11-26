import { useState } from 'react';
import { Table } from '@mantine/core';
import {
  IconCircleCheck,
  IconClipboardText,
  IconPackage,
  IconShoppingCart,
  IconRepeat,
  IconTruck,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { viewAction } from '@/module/purchases/presentation/components/lists/rowActions';
import { ListSummaryCards } from '@/module/purchases/presentation/components/lists/ListSummaryCards';
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
import { ReorderDialog } from '@/module/purchases/presentation/components/orders/ReorderDialog';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';

export const OrderList = () => {
  const { t, currentLanguage } = useTranslation('purchases');
  const navigate = useNavigate();
  const state = useListState();
  const query = useOrders(state.params);
  const { can } = usePurchaseAccess();
  const [reorderId, setReorderId] = useState<string | null>(null);

  return (
    <>
      <ListShell
        summary={
          query.data?.summary && (
            <ListSummaryCards
              icons={[IconShoppingCart, IconTruck, IconClipboardText, IconCircleCheck]}
              items={(
                [
                  ['total', query.data.summary.total],
                  ['waitingReceipt', query.data.summary.waitingReceipt],
                  ['partiallyReceived', query.data.summary.partiallyReceived],
                  ['completed', query.data.summary.completed],
                ] as const
              ).map(([key, value]) => ({
                label: t(`hub.listSummary.orders.${key}.label`),
                hint: t(`hub.listSummary.orders.${key}.hint`),
                value,
              }))}
            />
          )
        }
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
              sub={`${row.documentLabel} · ${formatDay(row.date, currentLanguage)}${row.reorderSourceRef ? ` · ${t('orders.reorder.fromSource', { number: row.reorderSourceRef.number })}` : ''}`}
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
          ...(row.canReorder && can(PURCHASE_MENU.documents, 'create')
            ? [
                {
                  label: t('orders.reorder.menuLabel'),
                  icon: <IconRepeat size={16} />,
                  onClick: () => setReorderId(row.id),
                },
              ]
            : []),
        ]}
        empty={{
          icon: <IconPackage size={32} stroke={1.6} />,
          title: t('hub.orders.emptyTitle'),
          description: t('hub.orders.emptyDescription'),
        }}
      />
      <ReorderDialog
        opened={Boolean(reorderId)}
        sourceId={reorderId}
        onClose={() => setReorderId(null)}
      />
    </>
  );
};
