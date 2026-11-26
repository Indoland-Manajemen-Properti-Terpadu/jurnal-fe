import { useState } from 'react';
import { Select, Table } from '@mantine/core';
import { IconClipboardCheck, IconClock, IconReceipt, IconTruckDelivery } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { RECEIPT_STATUSES } from '@/module/purchases/domain/purchaseStatus';
import { detailPath } from '@/module/purchases/presentation/components/hub/documentPaths';
import { viewAction } from '@/module/purchases/presentation/components/lists/rowActions';
import { ListSummaryCards } from '@/module/purchases/presentation/components/lists/ListSummaryCards';
import { NumberCell, TextCell } from '@/module/purchases/presentation/components/lists/cells';
import { ListShell } from '@/module/purchases/presentation/components/shared/ListShell';
import {
  formatDay,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';
import { ReceiptStatusBadge } from '@/module/purchases/presentation/components/receipts/ReceiptStatusBadge';
import { useListState } from '@/module/purchases/presentation/components/shared/useListState';
import { useReceipts } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

export const ReceiptList = () => {
  const { t, currentLanguage } = useTranslation('purchases');
  const navigate = useNavigate();
  const state = useListState();
  const [kind, setKind] = useState<'GOODS' | 'SERVICE' | null>(null);
  const query = useReceipts({ ...state.params, ...(kind ? { kind } : {}) });

  return (
    <ListShell
      summary={
        query.data?.summary && (
          <ListSummaryCards
            icons={[IconTruckDelivery, IconClock, IconReceipt, IconClipboardCheck]}
            items={(
              [
                ['total', query.data.summary.total],
                ['pendingApproval', query.data.summary.pendingApproval],
                ['unbilled', query.data.summary.unbilled],
                ['billed', query.data.summary.billed],
              ] as const
            ).map(([key, value]) => ({
              label: t(`hub.listSummary.receipts.${key}.label`),
              hint: t(`hub.listSummary.receipts.${key}.hint`),
              value,
            }))}
          />
        )
      }
      searchValue={state.searchInput}
      onSearchChange={state.setSearch}
      searchPlaceholder={t('hub.receipts.search')}
      statusValue={state.status}
      onStatusChange={state.setStatus}
      statusOptions={RECEIPT_STATUSES.map((status) => ({
        value: status,
        label: t(`status.${status}`),
      }))}
      filters={
        <Select
          clearable
          radius="md"
          w={{ base: '100%', sm: 190 }}
          aria-label={t('hub.receipts.kind')}
          placeholder={t('hub.receipts.kind')}
          data={(['GOODS', 'SERVICE'] as const).map((value) => ({
            value,
            label: t(`hub.receipts.kinds.${value}`),
          }))}
          value={kind}
          onChange={(value) => {
            setKind(value as 'GOODS' | 'SERVICE' | null);
            state.setPage(1);
          }}
        />
      }
      columns={[
        { key: 'number', label: t('hub.receipts.colReceipt') },
        { key: 'vendor', label: t('common.vendor'), minWidth: 180 },
        { key: 'note', label: t('hub.receipts.note') },
        { key: 'quantity', label: t('hub.receipts.quantity'), align: 'right' },
        { key: 'status', label: t('hub.receipts.billed') },
      ]}
      rows={query.data?.items}
      getKey={(row) => row.id}
      onRowClick={(row) => navigate(detailPath('receipt', row.id))}
      renderCells={(row) => (
        <>
          <NumberCell
            kind="receipt"
            id={row.id}
            number={row.number}
            sub={`${formatDay(row.date, currentLanguage)} · ${row.purchaseOrderNumber}`}
          />
          <TextCell value={row.vendor.name} maxWidth={260} />
          <TextCell value={row.deliveryNote} />
          <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatQuantity(row.items.reduce((total, item) => total + item.receivedQty, 0))}
          </Table.Td>
          <Table.Td>
            <ReceiptStatusBadge receipt={row} />
          </Table.Td>
        </>
      )}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={query.refetch}
      isFiltered={state.isFiltered || kind !== null}
      onResetFilters={() => {
        state.reset();
        setKind(null);
      }}
      page={state.page}
      totalPages={query.data?.totalPages ?? 0}
      totalResults={query.data?.totalResults ?? 0}
      onPageChange={state.setPage}
      noun={t('list.nouns.receipt')}
      limit={state.limit}
      onLimitChange={state.setLimit}
      rowActions={(row) => [
        viewAction(t('list.view'), () => navigate(detailPath('receipt', row.id))),
      ]}
      empty={{
        icon: <IconTruckDelivery size={32} stroke={1.6} />,
        title: t('hub.receipts.emptyTitle'),
        description: t('hub.receipts.emptyDescription'),
      }}
    />
  );
};
