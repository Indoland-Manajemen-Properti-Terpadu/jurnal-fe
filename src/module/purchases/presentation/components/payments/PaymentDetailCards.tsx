import { Anchor, Table, Text } from '@mantine/core';
import { IconClipboardText, IconListDetails, IconSum } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { cashOutOf } from '@/module/purchases/domain/paymentForm';
import type { PaymentVoucher } from '@/module/purchases/domain/purchaseDocuments';
import { InfoGrid } from '@/module/purchases/presentation/components/shared/InfoGrid';
import { MoneyRows } from '@/module/purchases/presentation/components/shared/MoneyRows';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import { routes } from '@/router/routes';

/** Who is paid, when, how, and the reference that ties it to the bank. */
export const PaymentInfoCard = ({ doc }: Readonly<{ doc: PaymentVoucher }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  return (
    <SectionCard icon={IconClipboardText} title={t('payments.detail.infoTitle')}>
      <InfoGrid
        items={[
          { label: t('payments.detail.vendor'), value: doc.vendor.name },
          { label: t('payments.detail.date'), value: formatDay(doc.date, currentLanguage) },
          {
            label: t('payments.detail.method'),
            value: doc.paymentMethod?.name ?? '',
          },
          { label: t('payments.detail.reference'), value: doc.referenceNumber },
          ...(doc.paidAt
            ? [
                {
                  label: t('payments.detail.paidAt'),
                  value: formatDay(doc.paidAt.slice(0, 10), currentLanguage),
                },
              ]
            : []),
          ...(doc.memo
            ? [{ label: t('payments.detail.memo'), value: doc.memo, span: 2 as const }]
            : []),
          ...(doc.voidReason
            ? [{ label: t('payments.detail.voidReason'), value: doc.voidReason, span: 2 as const }]
            : []),
        ]}
      />
      {doc.journalId && (
        <Text size="xs" c="dimmed">
          {t('payments.detail.journal')}
        </Text>
      )}
    </SectionCard>
  );
};

/** The Payment Requests a voucher pays, and the bill or order of each. */
export const PaymentItemsCard = ({ doc }: Readonly<{ doc: PaymentVoucher }>) => {
  const { t } = useTranslation('purchases');
  return (
    <SectionCard
      icon={IconListDetails}
      title={t('payments.detail.itemsTitle')}
      subtitle={t('payments.detail.itemsSubtitle')}
    >
      <Table.ScrollContainer minWidth={520}>
        <Table verticalSpacing="xs" horizontalSpacing="sm">
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              {(['request', 'target', 'amount'] as const).map((key) => (
                <Table.Th key={key} ta={key === 'amount' ? 'right' : undefined}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    {t(`payments.detail.col.${key}`)}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {doc.items.map((item) => (
              <Table.Tr key={item.requestId}>
                <Table.Td>
                  <Anchor
                    component={Link}
                    to={routes.purchases.paymentRequestDetail.replace(':id', item.requestId)}
                    size="sm"
                    fw={500}
                  >
                    {item.requestNumber}
                  </Anchor>
                </Table.Td>
                <Table.Td>
                  {item.billId ? (
                    <Anchor
                      component={Link}
                      to={routes.purchases.billDetail.replace(':id', item.billId)}
                      size="sm"
                    >
                      {item.billNumber}
                    </Anchor>
                  ) : item.orderId ? (
                    <Anchor
                      component={Link}
                      to={routes.purchases.orderDetail.replace(':id', item.orderId)}
                      size="sm"
                    >
                      {t('payments.detail.advanceFor', { order: item.orderNumber ?? '' })}
                    </Anchor>
                  ) : (
                    '-'
                  )}
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

export const PaymentAmountsCard = ({ doc }: Readonly<{ doc: PaymentVoucher }>) => {
  const { t } = useTranslation('purchases');
  return (
    <SectionCard icon={IconSum} title={t('payments.detail.amountsTitle')}>
      <MoneyRows
        rows={[
          { label: t('payments.detail.total'), amount: formatAmount(doc.totalAmount) },
          ...(doc.adminFee > 0
            ? [{ label: t('payments.detail.fee'), amount: formatAmount(doc.adminFee) }]
            : []),
          {
            label: t('payments.detail.cashOut'),
            amount: formatAmount(cashOutOf(doc.totalAmount, doc.adminFee)),
            emphasis: 'total' as const,
          },
        ]}
      />
    </SectionCard>
  );
};
