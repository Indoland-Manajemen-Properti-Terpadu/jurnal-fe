import { Anchor, Table, Text } from '@mantine/core';
import { IconClipboardText, IconListDetails } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { PaymentRequest } from '@/module/purchases/domain/paymentRequest';
import { InfoGrid } from '@/module/purchases/presentation/components/shared/InfoGrid';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import { routes } from '@/router/routes';

/** Who is paid, for what, and where the request stands. */
export const PaymentRequestInfoCard = ({ doc }: Readonly<{ doc: PaymentRequest }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  return (
    <SectionCard icon={IconClipboardText} title={t('paymentRequests.detail.infoTitle')}>
      <InfoGrid
        items={[
          { label: t('paymentRequests.detail.vendor'), value: doc.vendor?.name },
          { label: t('paymentRequests.detail.date'), value: formatDay(doc.date, currentLanguage) },
          {
            label: t('paymentRequests.detail.kind'),
            value:
              currentLanguage === 'id' && doc.kindLabel
                ? doc.kindLabel
                : t(`paymentRequests.kinds.${doc.kind}`),
          },
          {
            label: t('paymentRequests.detail.dueDate'),
            value: formatDay(doc.dueDate, currentLanguage),
          },
          ...(doc.order
            ? [
                {
                  label: t('paymentRequests.detail.order'),
                  value: (
                    <Anchor
                      component={Link}
                      to={routes.purchases.orderDetail.replace(':id', doc.order.id)}
                      size="sm"
                      fw={500}
                    >
                      {doc.order.number}
                    </Anchor>
                  ),
                },
              ]
            : []),
          ...(doc.voucher
            ? [
                {
                  label: t('paymentRequests.detail.voucher'),
                  value: (
                    <Anchor
                      component={Link}
                      to={routes.purchases.paymentDetail.replace(':id', doc.voucher.id)}
                      size="sm"
                      fw={500}
                    >
                      {doc.voucher.number}
                    </Anchor>
                  ),
                },
              ]
            : []),
          ...(doc.memo
            ? [{ label: t('paymentRequests.detail.memo'), value: doc.memo, span: 2 as const }]
            : []),
          ...(doc.cancelReason
            ? [
                {
                  label: t('paymentRequests.detail.cancelReason'),
                  value: doc.cancelReason,
                  span: 2 as const,
                },
              ]
            : []),
        ]}
      />
    </SectionCard>
  );
};

/** Bills of a settlement with the amount asked on each, or the advance of an order. */
export const PaymentRequestItemsCard = ({ doc }: Readonly<{ doc: PaymentRequest }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  if (doc.kind === 'DP') {
    return (
      <SectionCard
        icon={IconListDetails}
        title={t('paymentRequests.detail.advanceTitle')}
        subtitle={t('paymentRequests.detail.advanceSubtitle')}
      >
        <Text size="sm">
          {doc.order?.number} · {formatAmount(doc.amount)}
        </Text>
        {doc.advanceAppliedAmount > 0 && (
          <Text size="xs" c="dimmed">
            {t('paymentRequests.detail.advanceApplied', {
              amount: formatAmount(doc.advanceAppliedAmount),
            })}
          </Text>
        )}
      </SectionCard>
    );
  }
  return (
    <SectionCard
      icon={IconListDetails}
      title={t('paymentRequests.detail.itemsTitle')}
      subtitle={t('paymentRequests.detail.itemsSubtitle')}
    >
      <Table.ScrollContainer minWidth={560}>
        <Table verticalSpacing="xs" horizontalSpacing="sm">
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              {(['bill', 'dueDate', 'remaining', 'amount'] as const).map((key) => (
                <Table.Th
                  key={key}
                  ta={key === 'remaining' || key === 'amount' ? 'right' : undefined}
                >
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    {t(`paymentRequests.detail.col.${key}`)}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {doc.items.map((item) => (
              <Table.Tr key={item.bill.id}>
                <Table.Td>
                  <Anchor
                    component={Link}
                    to={routes.purchases.billDetail.replace(':id', item.bill.id)}
                    size="sm"
                    fw={500}
                  >
                    {item.bill.number}
                  </Anchor>
                  {item.bill.vendorInvoiceNumber && (
                    <Text size="xs" c="dimmed">
                      {item.bill.vendorInvoiceNumber}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatDay(item.bill.dueDate, currentLanguage)}</Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm">{formatAmount(item.bill.remainingAmount)}</Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" fw={600}>
                    {formatAmount(item.amount)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </SectionCard>
  );
};
