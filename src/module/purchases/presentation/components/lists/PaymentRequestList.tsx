import { useState } from 'react';
import { Anchor, Select, Table, Text } from '@mantine/core';
import { IconCoins, IconWallet } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import {
  PAYMENT_REQUEST_STATUSES,
  paymentRequestActions,
  vendorLabel,
  voucherProgress,
  type PaymentRequest,
  type PaymentRequestKind,
} from '@/module/purchases/domain/paymentRequest';
import { IssueVoucherDialog } from '@/module/purchases/presentation/components/paymentRequests/IssueVoucherDialog';
import { viewAction } from '@/module/purchases/presentation/components/lists/rowActions';
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
  const [issuing, setIssuing] = useState<PaymentRequest | null>(null);
  const query = usePaymentRequests({ ...state.params, kind: kind ?? undefined });
  const canCreate = can(PURCHASE_MENU.paymentRequests, 'create');

  return (
    <>
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
          { key: 'number', label: t('paymentRequests.list.col.request') },
          { key: 'vendor', label: t('common.vendor'), minWidth: 180 },
          { key: 'kind', label: t('paymentRequests.list.col.kind') },
          { key: 'status', label: t('common.status') },
          { key: 'voucher', label: t('paymentRequests.list.col.voucher') },
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
              sub={formatDay(row.date, currentLanguage)}
            />
            <TextCell value={vendorLabel(row) || '-'} maxWidth={260} />
            <TextCell value={t(`paymentRequests.kinds.${row.kind}`)} />
            <Table.Td>
              <StatusBadge status={row.status} label={row.statusLabel} />
            </Table.Td>
            <Table.Td style={{ whiteSpace: 'nowrap' }}>
              {voucherProgress(row) ? (
                <Text size="sm" c="dimmed">
                  {t('paymentRequests.list.vouchersIssued', voucherProgress(row) ?? {})}
                </Text>
              ) : row.voucher ? (
                <>
                  <Anchor
                    component={Link}
                    to={detailPath('payment', row.voucher.id)}
                    size="sm"
                    fw={500}
                    c="primary.7"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {row.voucher.number}
                  </Anchor>
                  {row.voucher.paidAt && (
                    <Text size="xs" c="dimmed">
                      {formatDay(row.voucher.paidAt.slice(0, 10), currentLanguage)}
                    </Text>
                  )}
                </>
              ) : (
                <Text size="sm" c="dimmed">
                  {t('paymentRequests.list.noVoucher')}
                </Text>
              )}
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
        noun={t('list.nouns.paymentRequest')}
        limit={state.limit}
        onLimitChange={state.setLimit}
        rowActions={(row) => [
          viewAction(t('list.view'), () => navigate(detailPath('paymentRequest', row.id))),
          ...(row.voucher
            ? [
                {
                  label: t('paymentRequests.list.viewVoucher'),
                  icon: <IconWallet size={16} />,
                  onClick: () =>
                    navigate(detailPath('payment', (row.voucher as { id: string }).id)),
                },
              ]
            : []),
          ...(paymentRequestActions(row).createVoucher && can(PURCHASE_MENU.payments, 'create')
            ? [
                {
                  label: t('paymentRequests.list.issueVoucher'),
                  icon: <IconWallet size={16} />,
                  onClick: () => setIssuing(row),
                },
              ]
            : []),
        ]}
        empty={{
          icon: <IconCoins size={32} stroke={1.6} />,
          title: t('paymentRequests.list.emptyTitle'),
          description: t('paymentRequests.list.emptyDescription'),
          actionLabel: canCreate ? t('paymentRequests.list.create') : undefined,
          onAction: canCreate ? () => navigate(routes.purchases.paymentRequestAdd) : undefined,
        }}
      />
      {issuing && <IssueVoucherDialog request={issuing} opened onClose={() => setIssuing(null)} />}
    </>
  );
};
