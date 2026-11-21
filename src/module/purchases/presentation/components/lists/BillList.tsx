import { Table } from '@mantine/core';
import { IconReceipt2 } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { detailPath } from '@/module/purchases/presentation/components/hub/documentPaths';
import {
  AmountCell,
  DueCell,
  NumberCell,
  PartyCell,
} from '@/module/purchases/presentation/components/lists/cells';
import { ListShell } from '@/module/purchases/presentation/components/shared/ListShell';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { useListState } from '@/module/purchases/presentation/components/shared/useListState';
import { useBills } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

export const BillList = () => {
  const { t, currentLanguage } = useTranslation('purchases');
  const navigate = useNavigate();
  const state = useListState();
  // The status filter is the list's tabs: not verified, owed, owed and late, paid, voided.
  const { status: displayStatus, ...rest } = state.params;
  const query = useBills({ ...rest, displayStatus: displayStatus || undefined });

  return (
    <ListShell
      searchValue={state.searchInput}
      onSearchChange={state.setSearch}
      searchPlaceholder={t('hub.bills.search')}
      statusValue={state.status}
      onStatusChange={state.setStatus}
      statusOptions={(['DRAFT', 'UNPAID', 'OVERDUE', 'PAID', 'VOID'] as const).map((status) => ({
        value: status,
        label: t(`hub.bills.display.${status}`),
      }))}
      columns={[
        { key: 'number', label: t('common.number') },
        { key: 'vendor', label: t('common.vendor'), minWidth: 180 },
        { key: 'due', label: t('hub.bills.dueDate') },
        { key: 'status', label: t('common.status') },
        { key: 'amount', label: t('hub.bills.payable'), align: 'right' },
        { key: 'remaining', label: t('hub.bills.remaining'), align: 'right' },
      ]}
      rows={query.data?.items}
      getKey={(row) => row.id}
      onRowClick={(row) => navigate(detailPath('bill', row.id))}
      renderCells={(row) => (
        <>
          <NumberCell kind="bill" id={row.id} number={row.number} />
          <PartyCell name={row.vendor.name} sub={row.vendorInvoiceNumber || undefined} />
          <DueCell
            label={formatDay(row.dueDate, currentLanguage)}
            overdue={row.displayStatus === 'OVERDUE'}
          />
          <Table.Td>
            <StatusBadge status={row.status} label={row.displayStatusLabel || row.statusLabel} />
          </Table.Td>
          <AmountCell value={row.finalAmount} />
          <AmountCell value={row.remainingAmount} dimmed={row.remainingAmount === 0} />
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
        icon: <IconReceipt2 size={32} stroke={1.6} />,
        title: t('hub.bills.emptyTitle'),
        description: t('hub.bills.emptyDescription'),
      }}
    />
  );
};
