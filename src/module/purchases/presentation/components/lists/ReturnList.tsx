import { Table } from '@mantine/core';
import { IconArrowBackUp } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { viewAction } from '@/module/purchases/presentation/components/lists/rowActions';
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
        { key: 'number', label: t('hub.returns.colReturn') },
        { key: 'vendor', label: t('common.vendor'), minWidth: 180 },
        { key: 'bill', label: t('hub.returns.bill') },
        { key: 'reason', label: t('hub.returns.reason'), minWidth: 180 },
        { key: 'settlement', label: t('hub.returns.settlement') },
        { key: 'status', label: t('common.status') },
        { key: 'amount', label: t('hub.returns.value'), align: 'right' },
      ]}
      rows={query.data?.items}
      getKey={(row) => row.id}
      onRowClick={(row) => navigate(detailPath('return', row.id))}
      renderCells={(row) => (
        <>
          <NumberCell
            kind="return"
            id={row.id}
            number={row.number}
            sub={formatDay(row.date, currentLanguage)}
          />
          <TextCell value={row.vendor.name} maxWidth={260} />
          <TextCell value={row.billNumber} />
          <TextCell value={row.reason} dimmed maxWidth={300} />
          <TextCell
            value={
              currentLanguage === 'id' && row.settlementLabel
                ? row.settlementLabel
                : t(`returns.form.settlement.${row.settlement}`)
            }
          />
          <Table.Td>
            <StatusBadge status={row.status} label={row.statusLabel} />
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
      noun={t('list.nouns.return')}
      limit={state.limit}
      onLimitChange={state.setLimit}
      rowActions={(row) => [
        viewAction(t('list.view'), () => navigate(detailPath('return', row.id))),
      ]}
      empty={{
        icon: <IconArrowBackUp size={32} stroke={1.6} />,
        title: t('hub.returns.emptyTitle'),
        description: t('hub.returns.emptyDescription'),
      }}
    />
  );
};
