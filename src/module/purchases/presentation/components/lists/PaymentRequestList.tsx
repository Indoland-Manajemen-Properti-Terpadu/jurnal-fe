import { useState } from 'react';
import { Select, Table } from '@mantine/core';
import { IconCoins } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import {
  PAYMENT_REQUEST_STATUSES,
  type PaymentRequestKind,
} from '@/module/purchases/domain/paymentRequest';
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
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { usePaymentRequests } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

export const PaymentRequestList = () => {
  const { t, currentLanguage } = useTranslation('purchases');
  const navigate = useNavigate();
  const { can } = usePurchaseAccess();
  const state = useListState();
  const [kind, setKind] = useState<PaymentRequestKind | null>(null);
  const query = usePaymentRequests({ ...state.params, kind: kind ?? undefined });
  const canCreate = can(PURCHASE_MENU.paymentRequests, 'create');

  return (
    <ListShell
      searchValue={state.searchInput}
      onSearchChange={state.setSearch}
      searchPlaceholder={t('paymentRequests.list.search')}
      statusValue={state.status}
      onStatusChange={state.setStatus}
      statusOptions={PAYMENT_REQUEST_STATUSES.map((status) => ({
        value: status,
        label: t(`status.${status}`),
      }))}
      filters={
        <Select
          value={kind}
          onChange={(value) => {
            setKind(value as PaymentRequestKind | null);
            state.setPage(1);
          }}
          data={(['SETTLEMENT', 'DP'] as const).map((value) => ({
            value,
            label: t(`paymentRequests.kinds.${value}`),
          }))}
          placeholder={t('paymentRequests.list.allKinds')}
          aria-label={t('paymentRequests.list.kindFilter')}
          clearable
          radius="md"
          w={190}
        />
      }
      columns={[
        { key: 'number', label: t('common.number') },
        { key: 'date', label: t('common.date') },
        { key: 'vendor', label: t('common.vendor'), minWidth: 180 },
        { key: 'target', label: t('paymentRequests.list.col.target'), minWidth: 160 },
        { key: 'dueDate', label: t('paymentRequests.list.col.dueDate') },
        { key: 'status', label: t('common.status') },
        { key: 'amount', label: t('common.amount'), align: 'right' },
      ]}
      rows={query.data?.items}
      getKey={(row) => row.id}
      onRowClick={(row) => navigate(detailPath('paymentRequest', row.id))}
      renderCells={(row) => (
        <>
          <NumberCell
            kind="paymentRequest"
            id={row.id}
            number={row.number}
            sub={t(`paymentRequests.kinds.${row.kind}`)}
          />
          <TextCell value={formatDay(row.date, currentLanguage)} />
          <TextCell value={row.vendor?.name ?? '-'} maxWidth={260} />
          <TextCell
            value={
              row.kind === 'DP'
                ? (row.order?.number ?? '-')
                : row.items.map((item) => item.bill.number).join(', ') || '-'
            }
            maxWidth={240}
            dimmed
          />
          <TextCell value={formatDay(row.dueDate, currentLanguage)} />
          <Table.Td>
            <StatusBadge status={row.status} label={row.statusLabel} />
          </Table.Td>
          <AmountCell value={row.amount} />
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
      empty={{
        icon: <IconCoins size={32} stroke={1.6} />,
        title: t('paymentRequests.list.emptyTitle'),
        description: t('paymentRequests.list.emptyDescription'),
        actionLabel: canCreate ? t('paymentRequests.list.create') : undefined,
        onAction: canCreate ? () => navigate(routes.purchases.paymentRequestAdd) : undefined,
      }}
    />
  );
};
