import { useState } from 'react';
import { Select, Table } from '@mantine/core';
import { IconWallet } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { VOUCHER_STATUSES } from '@/module/purchases/domain/purchaseStatus';
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
import { usePayments } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

export const PaymentList = () => {
  const { t, currentLanguage } = useTranslation('purchases');
  const navigate = useNavigate();
  const { can } = usePurchaseAccess();
  const state = useListState();
  const [type, setType] = useState<string | null>(null);
  const query = usePayments({ ...state.params, type });
  const canCreate = can(PURCHASE_MENU.payments, 'create');

  return (
    <ListShell
      searchValue={state.searchInput}
      onSearchChange={state.setSearch}
      searchPlaceholder={t('hub.payments.search')}
      statusValue={state.status}
      onStatusChange={state.setStatus}
      statusOptions={VOUCHER_STATUSES.map((status) => ({
        value: status,
        label: t(`status.${status}`),
      }))}
      filters={
        <Select
          value={type}
          onChange={(value) => {
            setType(value);
            state.setPage(1);
          }}
          data={[
            { value: 'BILL', label: t('hub.payments.types.BILL') },
            { value: 'ADVANCE', label: t('hub.payments.types.ADVANCE') },
          ]}
          placeholder={t('hub.payments.allTypes')}
          aria-label={t('hub.payments.typeFilter')}
          clearable
          radius="md"
          w={180}
        />
      }
      columns={[
        { key: 'number', label: t('common.number') },
        { key: 'date', label: t('common.date') },
        { key: 'vendor', label: t('common.vendor'), minWidth: 180 },
        { key: 'reference', label: t('common.reference') },
        { key: 'status', label: t('common.status') },
        { key: 'amount', label: t('common.amount'), align: 'right' },
      ]}
      rows={query.data?.items}
      getKey={(row) => row.id}
      onRowClick={(row) => navigate(detailPath('payment', row.id))}
      renderCells={(row) => (
        <>
          <NumberCell
            kind="payment"
            id={row.id}
            number={row.number}
            sub={t(`hub.payments.types.${row.type}`)}
          />
          <TextCell value={formatDay(row.date, currentLanguage)} />
          <TextCell value={row.vendor.name} maxWidth={260} />
          <TextCell value={row.referenceNumber} dimmed />
          <Table.Td>
            <StatusBadge status={row.status} />
          </Table.Td>
          <AmountCell value={row.totalAmount} />
        </>
      )}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={query.refetch}
      isFiltered={state.isFiltered || type !== null}
      onResetFilters={() => {
        state.reset();
        setType(null);
      }}
      page={state.page}
      totalPages={query.data?.totalPages ?? 0}
      totalResults={query.data?.totalResults ?? 0}
      onPageChange={state.setPage}
      empty={{
        icon: <IconWallet size={32} stroke={1.6} />,
        title: t('hub.payments.emptyTitle'),
        description: t('hub.payments.emptyDescription'),
        actionLabel: canCreate ? t('hub.createAdvance') : undefined,
        onAction: canCreate
          ? () => navigate(`${routes.purchases.paymentAdd}?type=advance`)
          : undefined,
      }}
    />
  );
};
