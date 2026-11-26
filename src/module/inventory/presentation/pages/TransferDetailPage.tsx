import { useMemo, useState } from 'react';
import { Alert, Anchor, Button, Group, Paper, Skeleton, Table, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowBackUp,
  IconArrowRight,
  IconCheck,
  IconClockHour4,
  IconLock,
  IconPackage,
  IconTransfer,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { ApiError } from '@/lib/http/apiError';
import { TransferInfoCard } from '@/module/inventory/presentation/components/stock/TransferInfoCard';
import { useTransferWarehouseName } from '@/module/inventory/presentation/hooks/useTransferWarehouseName';
import { isTransferValued } from '@/module/inventory/domain/stockTransfer';
import { columnHeader } from '@/module/inventory/presentation/components/shared/columnHeader';
import { DataTableFrame } from '@/module/inventory/presentation/components/shared/DataTableFrame';
import {
  DetailFrame,
  PageFrame,
} from '@/module/inventory/presentation/components/shared/DetailFrame';
import { SectionCard } from '@/module/inventory/presentation/components/shared/SectionCard';
import { stockTakeDetailPath } from '@/module/inventory/presentation/components/shared/stockLinks';
import { MovementsTable } from '@/module/inventory/presentation/components/stock/MovementsTable';
import { ApproveTransferDialog } from '@/module/inventory/presentation/components/stock/ApproveTransferDialog';
import { RejectTransferDialog } from '@/module/inventory/presentation/components/stock/RejectTransferDialog';
import { TransferStatusBadge } from '@/module/inventory/presentation/components/stock/TransferStatusBadge';
import { VoidTransferDialog } from '@/module/inventory/presentation/components/stock/VoidTransferDialog';
import { useFrozenWarehouses } from '@/module/inventory/presentation/hooks/useOpnames';
import {
  useMovements,
  useStockErrorMessage,
  useStockRights,
  useTransfer,
} from '@/module/inventory/presentation/hooks/useStockQueries';
import { useTransferMutations } from '@/module/inventory/presentation/hooks/useTransferMutations';
import { routes } from '@/router/routes';
import { formatCurrency, numberFormat } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';

const BACK = `${routes.inventory.stockMovements}?tab=transfers`;

/** One transfer: what moved, where, the movements it produced, and cancelling it. */
export default function TransferDetailPage() {
  const { t } = useTranslation('stockMovements');
  const { t: tf } = useTranslation('stockTake');
  const { id } = useParams<{ id: string }>();
  const describe = useStockErrorMessage();
  const { transfer: rights, card } = useStockRights();
  const { cancel, approve, reject } = useTransferMutations();
  const [voidOpen, setVoidOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const frozen = useFrozenWarehouses();
  const warehouseName = useTransferWarehouseName();

  const query = useTransfer(id);
  const { data } = query;
  const range = { startDate: data?.date.slice(0, 10), endDate: undefined, limit: 100 };
  const fromMoves = useMovements(
    { ...range, warehouse: data?.from.id },
    Boolean(data?.from.id) && card.read
  );
  const toMoves = useMovements(
    { ...range, warehouse: data?.to.id },
    Boolean(data?.to.id) && card.read
  );

  const movements = useMemo(() => {
    if (!data) return [];
    const all = [...(fromMoves.data?.items ?? []), ...(toMoves.data?.items ?? [])];
    return all
      .filter((move) => move.sourceId === data.id)
      .sort((a, b) => a.productName.localeCompare(b.productName) || b.type.localeCompare(a.type));
  }, [data, fromMoves.data, toMoves.data]);

  if (query.isLoading) {
    return (
      <PageFrame backTo={BACK} backLabel={t('detail.back')}>
        <Skeleton height={96} radius="lg" />
        <Skeleton height={160} radius="lg" />
        <Skeleton height={200} radius="lg" />
      </PageFrame>
    );
  }

  if (!data) {
    const missing = query.error instanceof ApiError && query.error.kind === 'notFound';
    return (
      <PageFrame backTo={BACK} backLabel={t('detail.back')}>
        <Paper withBorder radius="lg" bg="white">
          <EmptyState
            title={t(missing ? 'detail.notFound' : 'detail.loadFailed')}
            description={missing ? t('detail.notFoundBody') : describe(query.error)}
            icon={<IconTransfer size={36} stroke={1.5} />}
          />
        </Paper>
      </PageFrame>
    );
  }

  const fromName = warehouseName(data.from);
  const toName = warehouseName(data.to);
  const isPosted = data.status === 'posted';
  const isPending = data.status === 'pending';
  const isVoid = data.status === 'void';
  const showDecision = isPending && data.canDecide;
  const showValue = isTransferValued(data.status) && data.items.some((item) => item.value !== null);
  const totalValue = data.items.reduce((total, item) => total + (item.value ?? 0), 0);
  const movementValues = movements.some((move) => move.value !== null);
  // While a count holds either warehouse, cancelling would move stock in it.
  const frozenBy = frozen.get(data.from.id) ?? frozen.get(data.to.id);

  // Cancelling a posted transfer and withdrawing a waiting one are the same service call.
  const confirmVoid = (reason: string, kind: 'void' | 'withdraw') =>
    cancel.mutate(
      { id: data.id, reason },
      {
        onSuccess: () => {
          setVoidOpen(false);
          setWithdrawOpen(false);
          notifications.show({
            color: 'green',
            message: t(`detail.${kind}Done`, { number: data.number }),
          });
        },
        onError: (error) => {
          notifications.show({
            color: 'orange',
            autoClose: 7000,
            title: t(`detail.${kind}FailedTitle`),
            message: describe(error),
          });
        },
      }
    );

  // A refused decision keeps its dialog open, so the person reads why and can try again.
  const decideFailed = (title: string) => (error: unknown) => {
    notifications.show({
      color: 'orange',
      autoClose: 7000,
      title,
      message: describe(error),
    });
  };

  const confirmApprove = () =>
    approve.mutate(
      { id: data.id },
      {
        onSuccess: () => {
          setApproveOpen(false);
          notifications.show({
            color: 'green',
            message: t('detail.approveDone', { number: data.number }),
          });
        },
        onError: decideFailed(t('detail.approveFailedTitle')),
      }
    );

  const confirmReject = (reason: string) =>
    reject.mutate(
      { id: data.id, reason },
      {
        onSuccess: () => {
          setRejectOpen(false);
          notifications.show({
            color: 'green',
            message: t('detail.rejectDone', { number: data.number }),
          });
        },
        onError: decideFailed(t('detail.rejectFailedTitle')),
      }
    );

  return (
    <DetailFrame
      icon={IconTransfer}
      title={data.number}
      copyable
      badges={<TransferStatusBadge status={data.status} withdrawn={data.withdrawn} />}
      subtitle={
        <Group gap={6} wrap="wrap">
          <span>{dateFormatV1(data.date, 'D MMM YYYY')}</span>
          <span>·</span>
          <span>{fromName}</span>
          <IconArrowRight size={14} />
          <span>{toName}</span>
        </Group>
      }
      backTo={BACK}
      backLabel={t('detail.back')}
      actions={
        showDecision ? (
          <>
            <Button
              variant="default"
              color="red"
              leftSection={<IconX size={16} />}
              onClick={() => setRejectOpen(true)}
            >
              {t('detail.reject')}
            </Button>
            <Button leftSection={<IconCheck size={16} />} onClick={() => setApproveOpen(true)}>
              {t('detail.approve')}
            </Button>
          </>
        ) : undefined
      }
      menu={
        isPosted && rights.delete && !frozenBy
          ? [
              {
                label: t('detail.voidConfirm'),
                icon: IconTrash,
                onClick: () => setVoidOpen(true),
                danger: true,
              },
            ]
          : isPending && rights.delete
            ? [
                {
                  label: t('detail.withdrawMenu'),
                  icon: IconArrowBackUp,
                  onClick: () => setWithdrawOpen(true),
                },
              ]
            : undefined
      }
    >
      {isPending && (
        <Alert
          color="yellow"
          variant="light"
          radius="md"
          icon={<IconClockHour4 size={18} />}
          title={t('detail.pendingTitle')}
        >
          <Text size="sm">
            {data.waitingFor.length > 0
              ? t('detail.pendingBody', { roles: data.waitingFor.join(', ') })
              : t('detail.pendingBodyNoRoles')}
          </Text>
        </Alert>
      )}

      {isPosted && frozenBy && (
        <Alert
          color="yellow"
          variant="light"
          radius="md"
          icon={<IconLock size={18} />}
          title={tf('frozen.title')}
        >
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Text size="sm">{tf('frozen.transferHeld', { number: frozenBy.number })}</Text>
            <Anchor component={Link} to={stockTakeDetailPath(frozenBy.id)} size="sm" fw={600}>
              {tf('frozen.open')}
            </Anchor>
          </Group>
        </Alert>
      )}

      <TransferInfoCard
        transfer={data}
        fromName={fromName}
        toName={toName}
        totalValue={showValue ? totalValue : undefined}
      />

      <SectionCard
        icon={IconPackage}
        title={t('detail.itemsTitle')}
        count={t('detail.productCountValue', { count: data.items.length })}
      >
        <DataTableFrame minWidth={520} hover={false}>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              {columnHeader(t('detail.product'))}
              {columnHeader(t('detail.qty'), 'right')}
              {columnHeader(t('detail.unit'))}
              {showValue && columnHeader(t('detail.value'), 'right')}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.items.map((item) => (
              <Table.Tr key={item.productId}>
                <Table.Td>
                  <Text size="sm" fw={600} c="dark.8">
                    {item.name}
                  </Text>
                  {item.sku && (
                    <Text size="xs" c="dimmed">
                      {item.sku}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" fw={600}>
                    {numberFormat(item.quantity)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{item.unit || '-'}</Text>
                </Table.Td>
                {showValue && (
                  <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                    <Text size="sm">{item.value === null ? '-' : formatCurrency(item.value)}</Text>
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
          {showValue && data.items.length > 1 && (
            <Table.Tfoot>
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text size="sm" fw={700}>
                    {tf('summary.total')}
                  </Text>
                </Table.Td>
                <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                  <Text size="sm" fw={700}>
                    {formatCurrency(totalValue)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          )}
        </DataTableFrame>
      </SectionCard>

      {card.read && (isPosted || isVoid) && (
        <SectionCard
          icon={IconTransfer}
          title={t('detail.movementsTitle')}
          subtitle={t('detail.movementsSubtitle')}
          count={t('detail.movementsCount', { count: movements.length })}
        >
          {fromMoves.isLoading || toMoves.isLoading ? (
            <Skeleton height={120} radius="md" />
          ) : (
            movements.length > 0 && (
              <MovementsTable rows={movements} showValue={movementValues} withinDocument />
            )
          )}
        </SectionCard>
      )}

      <ApproveTransferDialog
        opened={approveOpen}
        number={data.number}
        fromName={fromName}
        toName={toName}
        productCount={data.productCount}
        saving={approve.isPending}
        onConfirm={confirmApprove}
        onClose={() => setApproveOpen(false)}
      />
      <RejectTransferDialog
        opened={rejectOpen}
        number={data.number}
        saving={reject.isPending}
        onConfirm={confirmReject}
        onClose={() => setRejectOpen(false)}
      />
      <VoidTransferDialog
        opened={voidOpen}
        number={data.number}
        fromName={fromName}
        saving={cancel.isPending}
        onConfirm={(reason) => confirmVoid(reason, 'void')}
        onClose={() => setVoidOpen(false)}
      />
      <VoidTransferDialog
        opened={withdrawOpen}
        mode="withdraw"
        number={data.number}
        fromName={fromName}
        saving={cancel.isPending}
        onConfirm={(reason) => confirmVoid(reason, 'withdraw')}
        onClose={() => setWithdrawOpen(false)}
      />
    </DetailFrame>
  );
}
