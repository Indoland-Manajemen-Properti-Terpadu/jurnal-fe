import { useState } from 'react';
import { Anchor, Badge, Box, SimpleGrid, Table, Text } from '@mantine/core';
import { IconShieldLock } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { OrderRetention, PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';
import { ReleaseRetentionDialog } from '@/module/purchases/presentation/components/hub/ReleaseRetentionDialog';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import { routes } from '@/router/routes';

interface OrderRetentionCardProps {
  orderId: string;
  retention: OrderRetention;
  isService: boolean;
  /** The bills of the order; the ones that release retention are listed. */
  bills: PurchaseBill[];
  canRelease: boolean;
}

/** "Retensi x%" of an order: what is held, what is released, when it can go, and the releases. */
export const OrderRetentionCard = ({
  orderId,
  retention,
  isService,
  bills,
  canRelease,
}: Readonly<OrderRetentionCardProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const [releasing, setReleasing] = useState(false);
  const doc = t(
    isService ? 'orders.detail.retention.docService' : 'orders.detail.retention.docGoods'
  );
  const releases = bills.filter(
    (bill) => bill.kind === 'RETENTION_RELEASE' && bill.status !== 'VOID'
  );
  const done = retention.released > 0 && retention.balance <= 0;
  const none = retention.state === 'NONE';
  const started = retention.maintenanceFrom !== null;
  const ready = retention.state === 'RELEASABLE';

  const badge = () => {
    if (done) {
      return { color: 'green', label: t('orders.detail.retention.badge.released') };
    }
    if (none) {
      return { color: 'gray', label: t('orders.detail.retention.badge.none') };
    }
    if (!started) {
      return { color: 'gray', label: t('orders.detail.retention.badge.waiting') };
    }
    if (ready) {
      return { color: 'green', label: t('orders.detail.retention.badge.ready') };
    }
    return {
      color: 'violet',
      label: t('orders.detail.retention.badge.from', {
        date: formatDay(retention.releasableFrom, currentLanguage),
      }),
    };
  };
  const status = badge();

  const note = () => {
    if (done) return t('orders.detail.retention.note.released');
    if (none) return t('orders.detail.retention.note.none');
    if (!started) return t('orders.detail.retention.note.waiting');
    if (ready) {
      return (
        <>
          {t('orders.detail.retention.note.ready')}
          {canRelease && (
            <>
              {' · '}
              <Anchor
                component="button"
                type="button"
                fz="inherit"
                fw={700}
                onClick={() => setReleasing(true)}
              >
                {t('orders.detail.retention.note.doNow')}
              </Anchor>
            </>
          )}
        </>
      );
    }
    return t('orders.detail.retention.note.held', {
      date: formatDay(retention.releasableFrom, currentLanguage),
      doc,
    });
  };

  const cells = [
    [t('orders.detail.retention.total'), retention.total],
    [t('orders.detail.retention.held'), retention.held],
    [t('orders.detail.retention.released'), retention.released],
    [t('orders.detail.retention.balance'), retention.balance],
  ] as const;

  return (
    <>
      <SectionCard
        icon={IconShieldLock}
        flush
        title={t('orders.detail.retention.title', { percent: retention.percent })}
        subtitle={
          none
            ? t('orders.detail.retention.subtitleNone')
            : t('orders.detail.retention.subtitle', {
                months: retention.maintenanceMonths,
                doc,
              })
        }
        action={
          <Badge size="sm" radius="sm" variant="light" color={status.color} tt="none">
            {status.label}
          </Badge>
        }
      >
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={1} verticalSpacing={1} bg="gray.2">
          {cells.map(([label, value]) => (
            <Box key={label} px="lg" py="sm" bg="white">
              <Text fz="xs" c="dimmed" fw={600}>
                {label}
              </Text>
              <Text fz="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatAmount(value)}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
        <Text
          fz="xs"
          c="dimmed"
          px="lg"
          py="sm"
          style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
        >
          {note()}
        </Text>
        {releases.length > 0 && (
          <Table.ScrollContainer type="native" minWidth={520}>
            <Table className={tableClasses.table} verticalSpacing="sm" horizontalSpacing="lg">
              <Table.Thead bg="var(--jurnal-color-surface-muted)">
                <Table.Tr>
                  <Table.Th>{t('orders.detail.retention.col.release')}</Table.Th>
                  <Table.Th>{t('orders.detail.retention.col.doc', { doc })}</Table.Th>
                  <Table.Th>{t('orders.detail.retention.col.status')}</Table.Th>
                  <Table.Th ta="right">{t('orders.detail.retention.col.remaining')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {releases.map((bill) => (
                  <Table.Tr key={bill.id}>
                    <Table.Td>
                      <Anchor
                        component={Link}
                        to={routes.purchases.billDetail.replace(':id', bill.id)}
                        size="sm"
                        fw={700}
                      >
                        {bill.number}
                      </Anchor>
                      <Text size="xs" c="dimmed">
                        {formatDay(bill.date, currentLanguage)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{bill.bastNumber || '-'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <StatusBadge
                        status={bill.status}
                        label={bill.displayStatusLabel || bill.statusLabel}
                      />
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm" fw={700}>
                        {formatAmount(bill.remainingAmount)}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </SectionCard>
      {releasing && (
        <ReleaseRetentionDialog purchaseOrderId={orderId} onClose={() => setReleasing(false)} />
      )}
    </>
  );
};
