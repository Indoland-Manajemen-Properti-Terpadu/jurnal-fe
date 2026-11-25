import { OrderAdvanceCard } from '@/module/purchases/presentation/components/orders/OrderAdvanceCard';
import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { Anchor, Progress, Stack, Table, Text } from '@mantine/core';
import { IconClipboardText, IconListDetails, IconSend, IconWallet } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { OrderItem, PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import { InfoGrid } from '@/module/purchases/presentation/components/shared/InfoGrid';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import {
  formatAmount,
  formatDay,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';
import { routes } from '@/router/routes';

const Progress2 = ({
  done,
  total,
  label,
}: Readonly<{ done: number; total: number; label: string }>) => (
  <div style={{ minWidth: 90 }}>
    <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
      {formatQuantity(done)} / {formatQuantity(total)}
    </Text>
    <Progress
      value={total > 0 ? Math.min(100, (done / total) * 100) : 0}
      size={4}
      radius="xl"
      color="primary"
      aria-label={label}
    />
  </div>
);

/** What a line bills: the whole amount, an advance, a term, a period or the retention. */
const useScheduleLabel = () => {
  const { t, currentLanguage } = useTranslation('purchases');
  return (item: OrderItem): string => {
    const { kind, seq, of, periodFrom, periodTo } = item.schedule;
    if (kind === 'PERIOD') {
      return t('orders.schedule.PERIOD', {
        seq,
        of,
        from: formatDay(periodFrom, currentLanguage),
        to: formatDay(periodTo, currentLanguage),
      });
    }
    return t(`orders.schedule.${kind}`, { seq, of });
  };
};

/** Header facts, the way the order is sent, the advance and the item lines of a PO / SPK. */
export const OrderSummaryCard = ({ order }: Readonly<{ order: PurchaseOrder }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const scheduleLabel = useScheduleLabel();
  const label = order.documentLabel;
  const showSchedule = order.items.some((item) => item.schedule.kind !== 'FULL');

  return (
    <Stack gap="lg">
      <SectionCard
        icon={IconClipboardText}
        label
        flush
        title={t('orders.detail.infoTitle', { label })}
        subtitle={t('orders.detail.infoSubtitle')}
      >
        <InfoGrid
          items={[
            { label: t('common.vendor'), value: order.vendor.name },
            {
              label: t('orders.detail.fromRequest'),
              value: order.purchaseRequestId ? (
                <Anchor
                  component={Link}
                  to={routes.purchases.requestDetail.replace(':id', order.purchaseRequestId)}
                  size="sm"
                  fw={500}
                >
                  {order.purchaseRequestNumber || t('orders.detail.openRequest')}
                </Anchor>
              ) : null,
            },
            { label: t('orders.form.date'), value: formatDay(order.date, currentLanguage) },
            {
              label: t('orders.form.expectedDate'),
              value: formatDay(order.expectedDate, currentLanguage),
            },
            { label: t('orders.form.paymentTerm'), value: order.paymentTermName ?? '' },
            { label: t('orders.detail.warranty'), value: order.warranty },
            { label: t('orders.draft.warehouse'), value: order.warehouse?.name ?? '' },
            { label: t('orders.form.deliveryAddress'), value: order.deliveryAddress },
            {
              label: t('orders.detail.receiptRule'),
              value: t(order.withReceipt ? 'orders.detail.withReceipt' : 'orders.detail.noReceipt'),
            },
            {
              label: t('orders.detail.pricing'),
              value: order.isPriceIncludeTax
                ? t('orders.detail.taxIncluded')
                : t('orders.detail.taxExcluded'),
            },
            { label: t('common.memo'), value: order.memo, span: 2 },
          ]}
        />
      </SectionCard>

      {order.status !== 'DRAFT' && (
        <SectionCard
          icon={IconSend}
          label
          flush
          title={t('orders.detail.sentTitle')}
          subtitle={t(
            order.sent.byEmail ? 'orders.detail.sentByEmail' : 'orders.detail.sentMarked'
          )}
        >
          <InfoGrid
            items={[
              { label: t('orders.send.to'), value: order.sent.to },
              { label: t('orders.send.cc'), value: order.sent.cc.join(', ') },
              { label: t('orders.send.note'), value: order.sent.note, span: 2 },
            ]}
          />
        </SectionCard>
      )}

      {order.advanceState && <OrderAdvanceCard advance={order.advanceState} />}

      {order.advance.amount > 0 && !order.advanceState && (
        <SectionCard
          icon={IconWallet}
          label
          flush
          title={t('orders.detail.advanceTitle')}
          subtitle={t('orders.detail.advanceSubtitle')}
        >
          <InfoGrid
            items={[
              {
                label: t('orders.detail.advance.amount'),
                value: formatAmount(order.advance.amount),
              },
              {
                label: t('orders.detail.advance.requested'),
                value: formatAmount(order.advance.requested),
              },
              { label: t('orders.detail.advance.paid'), value: formatAmount(order.advance.paid) },
              { label: t('orders.detail.advance.used'), value: formatAmount(order.advance.used) },
              {
                label: t('orders.detail.advance.available'),
                value: formatAmount(order.advance.available),
              },
            ]}
          />
        </SectionCard>
      )}

      <SectionCard
        icon={IconListDetails}
        flush
        title={t('orders.detail.itemsTitle')}
        subtitle={t('orders.detail.itemsSubtitle')}
        count={t('orders.detail.itemsCount', { count: order.items.length })}
      >
        <Table.ScrollContainer type="native" minWidth={760}>
          <Table className={tableClasses.table} verticalSpacing="sm" horizontalSpacing="lg">
            <Table.Thead bg="var(--jurnal-color-surface-muted)">
              <Table.Tr>
                {[
                  'item',
                  ...(showSchedule ? ['schedule'] : []),
                  'received',
                  'billed',
                  'unitPrice',
                  'amount',
                ].map((key) => (
                  <Table.Th
                    key={key}
                    ta={key === 'unitPrice' || key === 'amount' ? 'right' : undefined}
                  >
                    <Text size="xs" fw={700} c="dark.7">
                      {t(`orders.detail.col.${key}`)}
                    </Text>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {order.items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Text size="sm" fw={700}>
                      {item.product?.name ?? item.description}
                    </Text>
                    {item.product && item.description && (
                      <Text size="xs" c="dimmed">
                        {item.description}
                      </Text>
                    )}
                    {item.specification && (
                      <Text size="xs" c="dimmed">
                        {item.specification}
                      </Text>
                    )}
                    <Text size="xs" c="dimmed">
                      {formatQuantity(item.quantity)} {item.unitName ?? ''}
                      {item.tax ? ` · ${item.tax.name}` : ''}
                    </Text>
                  </Table.Td>
                  {showSchedule && (
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      <Text size="sm">{scheduleLabel(item)}</Text>
                    </Table.Td>
                  )}
                  <Table.Td>
                    {item.billOnly ? (
                      <Text size="xs" c="dimmed">
                        {t('orders.detail.billOnly')}
                      </Text>
                    ) : (
                      <Progress2
                        done={item.receivedQty}
                        total={item.quantity}
                        label={t('orders.detail.receivedAria')}
                      />
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Progress2
                      done={item.billedQty}
                      total={item.quantity}
                      label={t('orders.detail.billedAria')}
                    />
                  </Table.Td>
                  <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                    {formatAmount(item.unitPrice)}
                  </Table.Td>
                  <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                    {formatAmount(item.amount)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </SectionCard>
    </Stack>
  );
};
