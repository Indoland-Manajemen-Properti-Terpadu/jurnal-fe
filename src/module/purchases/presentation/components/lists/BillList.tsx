import { Table, Text } from '@mantine/core';
import { IconAlertTriangle, IconClock, IconReceipt2, IconWallet } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { viewAction } from '@/module/purchases/presentation/components/lists/rowActions';
import { ListSummaryCards } from '@/module/purchases/presentation/components/lists/ListSummaryCards';
import { useTranslation } from '@/i18n';
import { detailPath } from '@/module/purchases/presentation/components/hub/documentPaths';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import {
  DueCell,
  NumberCell,
  PartyCell,
} from '@/module/purchases/presentation/components/lists/cells';
import { ListShell } from '@/module/purchases/presentation/components/shared/ListShell';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { useListState } from '@/module/purchases/presentation/components/shared/useListState';
import { useBills } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';

export const BillList = () => {
  const { t, currentLanguage } = useTranslation('purchases');
  const navigate = useNavigate();
  const { can } = usePurchaseAccess();
  const state = useListState();
  // The status filter is the list's tabs: not verified, owed, owed and late, paid, voided.
  const { status: displayStatus, ...rest } = state.params;
  const query = useBills({ ...rest, displayStatus: displayStatus || undefined });

  return (
    <ListShell
      summary={
        query.data?.summary && (
          <ListSummaryCards
            icons={[IconReceipt2, IconClock, IconAlertTriangle, IconWallet]}
            precision={query.data?.precision}
            items={(
              [
                ['total', query.data.summary.total, false],
                ['unpaid', query.data.summary.unpaid, false],
                ['overdue', query.data.summary.overdue, false],
                ...(can(PURCHASE_MENU.reports, 'read')
                  ? ([['remainingPayable', query.data.summary.remainingPayable, true]] as const)
                  : []),
              ] as const
            ).map(([key, value, money]) => ({
              label: t(`hub.listSummary.bills.${key}.label`),
              hint: t(`hub.listSummary.bills.${key}.hint`),
              value,
              money,
            }))}
          />
        )
      }
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
          <NumberCell
            kind="bill"
            id={row.id}
            number={row.number}
            sub={row.vendorInvoiceNumber || undefined}
          />
          <PartyCell name={row.vendor.name} />
          <DueCell
            label={formatDay(row.dueDate, currentLanguage)}
            overdue={row.displayStatus === 'OVERDUE'}
          />
          <Table.Td>
            <StatusBadge status={row.status} label={row.displayStatusLabel || row.statusLabel} />
          </Table.Td>
          <Table.Td ta="right" style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
            <Text size="sm" fw={500}>
              {formatAmount(row.finalAmount)}
            </Text>
            {row.paidAmount > 0 && (
              <Text size="xs" c="green.7">
                {t('hub.bills.paidSub', { amount: formatAmount(row.paidAmount) })}
              </Text>
            )}
          </Table.Td>
          <Table.Td ta="right" style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
            <Text size="sm" fw={600} c={row.remainingAmount > 0 ? 'red.7' : 'green.7'}>
              {formatAmount(row.remainingAmount)}
            </Text>
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
      noun={t('list.nouns.bill')}
      limit={state.limit}
      onLimitChange={state.setLimit}
      rowActions={(row) => [viewAction(t('list.view'), () => navigate(detailPath('bill', row.id)))]}
      empty={{
        icon: <IconReceipt2 size={32} stroke={1.6} />,
        title: t('hub.bills.emptyTitle'),
        description: t('hub.bills.emptyDescription'),
      }}
    />
  );
};
