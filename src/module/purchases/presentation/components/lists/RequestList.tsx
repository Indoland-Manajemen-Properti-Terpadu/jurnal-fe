import { Table, Text } from '@mantine/core';
import { IconFilePlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { REQUEST_STATUSES } from '@/module/purchases/domain/purchaseStatus';
import { canCreateRequest } from '@/module/purchases/domain/requestAccess';
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
  const canCreate = canCreateRequest(can);

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
        { key: 'number', label: t('hub.requests.colRequest') },
        { key: 'purpose', label: t('common.purpose'), minWidth: 220 },
        { key: 'department', label: t('common.department') },
        { key: 'route', label: t('hub.requests.route') },
        { key: 'status', label: t('common.status') },
      ]}
      rows={query.data?.items}
      getKey={(row) => row.id}
      onRowClick={(row) => navigate(detailPath('request', row.id))}
      renderCells={(row) => (
        <>
          <NumberCell
            kind="request"
            id={row.id}
            number={row.number}
            sub={[formatDay(row.date, currentLanguage), row.requester?.name]
              .filter(Boolean)
              .join(' · ')}
          />
          <Table.Td style={{ maxWidth: 340 }}>
            <Text size="sm" fw={500} truncate>
              {row.purpose || '-'}
            </Text>
            {row.requiredDate && (
              <Text size="xs" c="dimmed">
                {t('hub.requests.neededOn', {
                  date: formatDay(row.requiredDate, currentLanguage),
                })}
              </Text>
            )}
          </Table.Td>
          <TextCell value={row.department?.name ?? ''} />
          <TextCell value={row.route ? t(`hub.requests.routes.${row.route}`) : ''} dimmed />
          <Table.Td>
            <StatusBadge status={row.status} label={row.statusLabel} />
          </Table.Td>
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
