import { Anchor, Badge, Progress, Stack, Table, Text } from '@mantine/core';
import { IconClipboardText, IconListDetails } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
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

/** Header facts and item lines of an order, with how much of each line is received and billed. */
export const OrderSummaryCard = ({ order }: Readonly<{ order: PurchaseOrder }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  return (
    <Stack gap="lg">
      <SectionCard icon={IconClipboardText} title={t('orders.detail.infoTitle')}>
        <InfoGrid
          items={[
            { label: t('common.vendor'), value: order.vendor.name },
            {
              label: t('orders.detail.fromRequest'),
              value: (
                <Anchor
                  component={Link}
                  to={routes.purchases.requestDetail.replace(':id', order.purchaseRequestId)}
                  size="sm"
                  fw={500}
                >
                  {t('orders.detail.openRequest')}
                </Anchor>
              ),
            },
            { label: t('orders.form.date'), value: formatDay(order.date, currentLanguage) },
            {
              label: t('orders.form.expectedDate'),
              value: formatDay(order.expectedDate, currentLanguage),
            },
            { label: t('orders.form.paymentTerm'), value: order.paymentTermName ?? '' },
            { label: t('orders.form.deliveryAddress'), value: order.deliveryAddress },
            {
              label: t('orders.detail.pricing'),
              value: (
                <Badge variant="light" color="gray" radius="sm">
                  {order.isPriceIncludeTax
                    ? t('orders.detail.taxIncluded')
                    : t('orders.detail.taxExcluded')}
                </Badge>
              ),
            },
            { label: t('common.memo'), value: order.memo },
          ]}
        />
      </SectionCard>

      <SectionCard
        icon={IconListDetails}
        title={t('orders.detail.itemsTitle')}
        subtitle={t('orders.detail.itemsSubtitle')}
      >
        <Table.ScrollContainer minWidth={720}>
          <Table verticalSpacing="sm">
            <Table.Thead bg="var(--jurnal-color-surface-hover)">
              <Table.Tr>
                {['item', 'received', 'billed', 'unitPrice', 'amount'].map((key) => (
                  <Table.Th
                    key={key}
                    ta={key === 'unitPrice' || key === 'amount' ? 'right' : undefined}
                  >
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
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
                    <Text size="sm" fw={500}>
                      {item.product?.name ?? item.description}
                    </Text>
                    {item.product && item.description && (
                      <Text size="xs" c="dimmed">
                        {item.description}
                      </Text>
                    )}
                    <Text size="xs" c="dimmed">
                      {formatQuantity(item.quantity)} {item.unitName ?? ''}
                      {item.tax ? ` · ${item.tax.name}` : ''}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Progress2
                      done={item.receivedQty}
                      total={item.quantity}
                      label={t('orders.detail.receivedAria')}
                    />
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
