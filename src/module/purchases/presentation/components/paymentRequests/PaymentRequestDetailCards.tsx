import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { Anchor, Box, Group, Table, Text } from '@mantine/core';
import { IconCalculator, IconClipboardText, IconListDetails } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { PaymentRequest } from '@/module/purchases/domain/paymentRequest';
import { SummaryRows } from '@/module/purchases/presentation/components/shared/SummaryRows';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { InfoGrid } from '@/module/purchases/presentation/components/shared/InfoGrid';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import { routes } from '@/router/routes';

/** Who is paid, for what, and where the request stands. */
export const PaymentRequestInfoCard = ({ doc }: Readonly<{ doc: PaymentRequest }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  return (
    <SectionCard
      icon={IconClipboardText}
      label
      flush
      title={t('paymentRequests.detail.infoTitle')}
      subtitle={t('paymentRequests.detail.infoSubtitle')}
    >
      <InfoGrid
        items={[
          { label: t('paymentRequests.detail.vendor'), value: doc.vendor?.name },
          {
            label: t('paymentRequests.detail.kind'),
            value:
              currentLanguage === 'id' && doc.kindLabel
                ? doc.kindLabel
                : t(`paymentRequests.kinds.${doc.kind}`),
          },
          { label: t('paymentRequests.detail.date'), value: formatDay(doc.date, currentLanguage) },
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
                      fw={700}
                    >
                      {doc.order.number}
                    </Anchor>
                  ),
                },
              ]
            : []),
          {
            label: t('paymentRequests.detail.paidOn'),
            value: doc.voucher?.paidAt
              ? formatDay(doc.voucher.paidAt.slice(0, 10), currentLanguage)
              : t('paymentRequests.detail.notPaid'),
          },
          {
            label: t('paymentRequests.detail.voucher'),
            value: doc.voucher ? (
              <Anchor
                component={Link}
                to={routes.purchases.paymentDetail.replace(':id', doc.voucher.id)}
                fw={700}
              >
                {doc.voucher.number}
              </Anchor>
            ) : (
              t('paymentRequests.detail.noVoucher')
            ),
          },
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

/** The money asked for, and the status it stands in. */
export const PaymentRequestSummaryCard = ({ doc }: Readonly<{ doc: PaymentRequest }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  return (
    <SectionCard
      icon={IconCalculator}
      label
      flush
      title={t('paymentRequests.detail.summaryTitle')}
      subtitle={t('paymentRequests.detail.summarySubtitle')}
    >
      <SummaryRows
        rows={[
          {
            label: t('paymentRequests.detail.kind'),
            value:
              currentLanguage === 'id' && doc.kindLabel
                ? doc.kindLabel
                : t(`paymentRequests.kinds.${doc.kind}`),
          },
          {
            label: t('common.status'),
            value:
              currentLanguage === 'id' && doc.statusLabel
                ? doc.statusLabel
                : t(`status.${doc.status}`),
          },
          ...(doc.advanceAppliedAmount > 0
            ? [
                {
                  label: t('paymentRequests.detail.advanceAppliedLabel'),
                  value: formatAmount(doc.advanceAppliedAmount),
                  tone: 'success' as const,
                },
              ]
            : []),
        ]}
        total={{ label: t('paymentRequests.detail.requested'), value: formatAmount(doc.amount) }}
      />
    </SectionCard>
  );
};

/** Bills of a settlement with the amount asked on each, or the advance of an order. */
export const PaymentRequestItemsCard = ({ doc }: Readonly<{ doc: PaymentRequest }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  if (doc.kind === 'DP') {
    const percent =
      doc.order && doc.order.total > 0
        ? Math.round((doc.amount / doc.order.total) * 1000) / 10
        : null;
    return (
      <SectionCard
        icon={IconListDetails}
        flush
        title={t('paymentRequests.detail.advanceTitle')}
        subtitle={t('paymentRequests.detail.advanceSubtitle')}
      >
        <Box px="lg" py="md">
          {doc.order && (
            <Group justify="space-between" py={4}>
              <Text size="sm" c="dimmed">
                {t('paymentRequests.detail.orderTotal')}
              </Text>
              <Text size="sm" fw={600}>
                {formatAmount(doc.order.total)}
              </Text>
            </Group>
          )}
          <Group justify="space-between" py={4}>
            <Text size="sm" c="dimmed">
              {percent === null
                ? t('paymentRequests.detail.advanceRow')
                : t('paymentRequests.detail.advancePercent', { percent })}
            </Text>
            <Text size="sm" fw={700} c="orange.8">
              {formatAmount(doc.amount)}
            </Text>
          </Group>
          {doc.advanceAppliedAmount > 0 && (
            <Text size="xs" c="dimmed" mt={4}>
              {t('paymentRequests.detail.advanceApplied', {
                amount: formatAmount(doc.advanceAppliedAmount),
              })}
            </Text>
          )}
        </Box>
      </SectionCard>
    );
  }
  return (
    <SectionCard
      icon={IconListDetails}
      flush
      title={t('paymentRequests.detail.itemsTitle')}
      subtitle={t('paymentRequests.detail.itemsSubtitle')}
      count={t('paymentRequests.detail.itemsCount', { count: doc.items.length })}
    >
      <Table.ScrollContainer type="native" minWidth={560}>
        <Table className={tableClasses.table} verticalSpacing="sm" horizontalSpacing="lg">
          <Table.Thead bg="var(--jurnal-color-surface-muted)">
            <Table.Tr>
              {(['bill', 'dueDate', 'status', 'remaining', 'amount'] as const).map((key) => (
                <Table.Th
                  key={key}
                  ta={key === 'remaining' || key === 'amount' ? 'right' : undefined}
                >
                  <Text size="xs" fw={700} c="dark.7">
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
                    fw={700}
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
                <Table.Td>
                  <StatusBadge status={item.bill.status as 'VERIFIED'} />
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm">{formatAmount(item.bill.remainingAmount)}</Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" fw={700}>
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
