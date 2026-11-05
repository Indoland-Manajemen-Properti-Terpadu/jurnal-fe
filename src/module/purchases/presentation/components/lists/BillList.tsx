import { useState } from 'react';
import { Switch, Table } from '@mantine/core';
import { IconReceipt2 } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { isBillOverdue } from '@/module/purchases/domain/purchaseActions';
import { BILL_STATUSES } from '@/module/purchases/domain/purchaseStatus';
import { detailPath } from '@/module/purchases/presentation/components/hub/documentPaths';
import {
  AmountCell,
  DueCell,
  NumberCell,
  PartyCell,
} from '@/module/purchases/presentation/components/lists/cells';
import { ListShell } from '@/module/purchases/presentation/components/shared/ListShell';
import { formatDay, todayIso } from '@/module/purchases/presentation/components/shared/format';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { useListState } from '@/module/purchases/presentation/components/shared/useListState';
import { useBills } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

export const BillList = () => {
  const { t, currentLanguage } = useTranslation('purchases');
  const navigate = useNavigate();
  const state = useListState();
  const [overdueOnly, setOverdueOnly] = useState(false);
  const query = useBills({ ...state.params, overdue: overdueOnly || undefined });
  const today = todayIso();

  return (
    <ListShell
      searchValue={state.searchInput}
      onSearchChange={state.setSearch}
      searchPlaceholder={t('hub.bills.search')}
      statusValue={state.status}
      onStatusChange={state.setStatus}
      statusOptions={BILL_STATUSES.map((status) => ({
        value: status,
        label: t(`status.${status}`),
      }))}
      filters={
        <Switch
          label={t('hub.bills.overdueOnly')}
          checked={overdueOnly}
          onChange={(event) => {
            setOverdueOnly(event.currentTarget.checked);
            state.setPage(1);
          }}
          pb={8}
        />
      }
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
      renderCells={(row) => {
        const overdue = isBillOverdue(row, today);
        return (
          <>
            <NumberCell kind="bill" id={row.id} number={row.number} />
            <PartyCell name={row.vendor.name} sub={row.vendorInvoiceNumber || undefined} />
            <DueCell label={formatDay(row.dueDate, currentLanguage)} overdue={overdue} />
            <Table.Td>
              <StatusBadge status={row.status} />
            </Table.Td>
            <AmountCell value={row.finalAmount} />
            <AmountCell value={row.remainingAmount} dimmed={row.remainingAmount === 0} />
          </>
        );
      }}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={query.refetch}
      isFiltered={state.isFiltered || overdueOnly}
      onResetFilters={() => {
        state.reset();
        setOverdueOnly(false);
      }}
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
