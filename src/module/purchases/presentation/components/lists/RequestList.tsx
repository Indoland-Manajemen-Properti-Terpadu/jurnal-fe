import { Table } from '@mantine/core';
import { IconFilePlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { REQUEST_STATUSES } from '@/module/purchases/domain/purchaseStatus';
import { detailPath } from '@/module/purchases/presentation/components/hub/documentPaths';
import { NumberCell, TextCell } from '@/module/purchases/presentation/components/lists/cells';
import { ListShell } from '@/module/purchases/presentation/components/shared/ListShell';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { useListState } from '@/module/purchases/presentation/components/shared/useListState';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useRequests } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

export const RequestList = () => {
  const { t, currentLanguage } = useTranslation('purchases');
  const navigate = useNavigate();
  const { can } = usePurchaseAccess();
  const state = useListState();
  const query = useRequests(state.params);
  const canCreate = can(PURCHASE_MENU.documents, 'create');

  return (
    <ListShell
      searchValue={state.searchInput}
      onSearchChange={state.setSearch}
      searchPlaceholder={t('hub.requests.search')}
      statusValue={state.status}
      onStatusChange={state.setStatus}
      statusOptions={REQUEST_STATUSES.map((status) => ({
        value: status,
        label: t(`status.${status}`),
      }))}
      columns={[
        { key: 'number', label: t('common.number') },
        { key: 'date', label: t('common.date') },
        { key: 'purpose', label: t('common.purpose'), minWidth: 200 },
        { key: 'department', label: t('common.department') },
        { key: 'mode', label: t('hub.requests.mode') },
        { key: 'status', label: t('common.status') },
        { key: 'items', label: t('hub.requests.items'), align: 'right' },
      ]}
      rows={query.data?.items}
      getKey={(row) => row.id}
      onRowClick={(row) => navigate(detailPath('request', row.id))}
      renderCells={(row) => (
        <>
          <NumberCell kind="request" id={row.id} number={row.number} />
          <TextCell value={formatDay(row.date, currentLanguage)} />
          <TextCell value={row.purpose} maxWidth={320} />
          <TextCell value={row.department} dimmed />
          <TextCell value={t(`hub.requests.modes.${row.mode}`)} dimmed />
          <Table.Td>
            <StatusBadge status={row.status} />
          </Table.Td>
          <TextCell value={String(row.items.length)} dimmed />
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
        icon: <IconFilePlus size={32} stroke={1.6} />,
        title: t('hub.requests.emptyTitle'),
        description: t('hub.requests.emptyDescription'),
        actionLabel: canCreate ? t('hub.createRequest') : undefined,
        onAction: canCreate ? () => navigate(routes.purchases.requestAdd) : undefined,
      }}
    />
  );
};
