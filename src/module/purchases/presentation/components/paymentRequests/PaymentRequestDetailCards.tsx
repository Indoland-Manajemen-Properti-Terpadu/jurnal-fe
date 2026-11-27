import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { Anchor, Box, Group, Table, Text } from '@mantine/core';
import { IconCalculator, IconClipboardText, IconCoins, IconListDetails } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import {
  paymentRequestAmountsVisible,
  vendorLabel,
  type PaymentRequest,
} from '@/module/purchases/domain/paymentRequest';
import type { PurchaseStatus } from '@/module/purchases/domain/purchaseStatus';
import { SummaryRows } from '@/module/purchases/presentation/components/shared/SummaryRows';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { InfoGrid } from '@/module/purchases/presentation/components/shared/InfoGrid';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import { routes } from '@/router/routes';

/** Who is paid, for what, and where the request stands. */
export const PaymentRequestInfoCard = ({
  doc,
  vendorBankLabel,
  relatedOrders = [],
  paymentTermName,
}: Readonly<{
  doc: PaymentRequest;
  vendorBankLabel?: string;
  relatedOrders?: { id: string; number: string }[];
  paymentTermName?: string;
}>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const orders = doc.order ? [doc.order] : relatedOrders;
  const kindLabel =
    currentLanguage === 'id' && doc.kindLabel
      ? doc.kindLabel
      : t(`paymentRequests.kinds.${doc.kind}`);
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
          { label: t('paymentRequests.detail.vendor'), value: vendorLabel(doc) },
          {
            label: t('paymentRequests.detail.paymentKind'),
            value:
              doc.kind === 'DP' && paymentTermName
                ? `${kindLabel} · ${paymentTermName}`
                : kindLabel,
          },
          { label: t('paymentRequests.detail.date'), value: formatDay(doc.date, currentLanguage) },
          ...(orders.length > 0
            ? [
                {
                  label: t('paymentRequests.detail.order'),
                  value: (
                    <Group gap="sm" wrap="wrap">
                      {orders.map((order) => (
                        <Anchor
                          key={order.id}
                          component={Link}
                          to={routes.purchases.orderDetail.replace(':id', order.id)}
                          fw={700}
                        >
                          {order.number}
                        </Anchor>
                      ))}
                    </Group>
                  ),
                },
              ]
            : []),
          ...(!doc.isMultiVendor
            ? [{ label: t('paymentRequests.detail.targetBank'), value: vendorBankLabel ?? '—' }]
            : []),
          {
            label: t('paymentRequests.detail.paidOn'),
            value: doc.voucher?.paidAt
              ? formatDay(doc.voucher.paidAt.slice(0, 10), currentLanguage)
              : t('paymentRequests.detail.notPaid'),
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
export const PaymentRequestSummaryCard = ({
  doc,
  vendorBankLabel,
}: Readonly<{ doc: PaymentRequest; vendorBankLabel?: string }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const showAmounts = paymentRequestAmountsVisible(doc.status, doc.approval);
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
                : doc.status === 'APPROVED' || doc.status === 'PROCESSED'
                  ? t(`paymentRequests.statusLabels.${doc.status}`)
                  : t(`status.${doc.status}`),
          },
          ...(!doc.isMultiVendor
            ? [{ label: t('paymentRequests.detail.targetBank'), value: vendorBankLabel ?? '—' }]
            : []),
          ...(showAmounts && doc.advanceAppliedAmount > 0
            ? [
                {
                  label: t('paymentRequests.detail.advanceAppliedLabel'),
                  value: formatAmount(doc.advanceAppliedAmount),
                  tone: 'success' as const,
                },
              ]
            : []),
        ]}
        total={{
          label: t('paymentRequests.detail.requested'),
          value: showAmounts ? formatAmount(doc.amount) : '—',
        }}
      />
    </SectionCard>
  );
};

/** The Payment Voucher that pays this request, or the next step before Finance issues it. */
export const PaymentRequestVoucherCard = ({
  doc,
  depositAccountLabel,
}: Readonly<{ doc: PaymentRequest; depositAccountLabel?: string }>) => {
  const { t } = useTranslation('purchases');
  const showAmounts = paymentRequestAmountsVisible(doc.status, doc.approval);
  const { voucher } = doc;

  return (
    <SectionCard
      icon={IconCoins}
      flush
      title={t('paymentRequests.detail.voucherTitle')}
      subtitle={t('paymentRequests.detail.voucherSubtitle')}
      count={voucher ? '1 PV' : undefined}
    >
      {voucher ? (
        <Table.ScrollContainer type="native" minWidth={480}>
          <Table className={tableClasses.table} verticalSpacing="sm" horizontalSpacing="lg">
            <Table.Thead bg="var(--jurnal-color-surface-muted)">
              <Table.Tr>
                {(['number', 'vendor', 'depositAccount', 'status', 'amount'] as const).map(
                  (key) => (
                    <Table.Th key={key} ta={key === 'amount' ? 'right' : undefined}>
                      <Text size="xs" fw={700} c="dark.7">
                        {t(`paymentRequests.detail.voucherCol.${key}`)}
                      </Text>
                    </Table.Th>
                  )
                )}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>
                  <Anchor
                    component={Link}
                    to={routes.purchases.paymentDetail.replace(':id', voucher.id)}
                    size="sm"
                    fw={700}
                  >
                    {voucher.number}
                  </Anchor>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{vendorLabel(doc)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{depositAccountLabel || '—'}</Text>
                </Table.Td>
                <Table.Td>
                  {voucher.status ? (
                    <StatusBadge
                      status={voucher.status as PurchaseStatus}
                      label={t(`paymentRequests.detail.voucherStatus.${voucher.status}`)}
                      englishLabel={t(`paymentRequests.detail.voucherStatus.${voucher.status}`)}
                    />
                  ) : (
                    <Text size="sm" c="dimmed">
                      {t('paymentRequests.detail.noVoucherStatus')}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" fw={700}>
                    {showAmounts ? formatAmount(voucher.totalAmount) : '—'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      ) : (
        <Box px="lg" py="md">
          <Text size="sm" c="dimmed">
            {t('paymentRequests.detail.voucherNotIssued')}
          </Text>
        </Box>
      )}
    </SectionCard>
  );
};

/** Bills of a settlement with the amount asked on each, or the advance of an order. */
export const PaymentRequestItemsCard = ({
  doc,
  paymentTermName,
}: Readonly<{ doc: PaymentRequest; paymentTermName?: string }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const showAmounts = paymentRequestAmountsVisible(doc.status, doc.approval);
  if (doc.kind === 'DP') {
    const percent =
      showAmounts && doc.order && doc.order.total > 0
        ? Math.round((doc.amount / doc.order.total) * 1000) / 10
        : null;
    return (
      <SectionCard
        icon={IconListDetails}
        flush
        title={t('paymentRequests.detail.basisTitle')}
        subtitle={t('paymentRequests.detail.basisSubtitle')}
      >
        <Box px="lg" py="md">
          {doc.order && (
            <Group justify="space-between" py={4}>
              <Text size="sm" c="dimmed">
                {t('paymentRequests.detail.orderTotal')}
              </Text>
              <Text size="sm" fw={600}>
                {showAmounts ? formatAmount(doc.order.total) : '—'}
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
              {showAmounts ? formatAmount(doc.amount) : '—'}
            </Text>
          </Group>
          <Group justify="space-between" py={4}>
            <Text size="sm" c="dimmed">
              {t('paymentRequests.detail.termLabel')}
            </Text>
            <Text size="sm" fw={600} ta="right">
              {paymentTermName || '—'}
            </Text>
          </Group>
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
              {(
                [
                  'bill',
                  ...(doc.isMultiVendor ? ['vendor' as const] : []),
                  'dueDate',
                  'status',
                  'amount',
                  'remaining',
                ] as const
              ).map((key) => (
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
                {doc.isMultiVendor && (
                  <Table.Td>
                    <Text size="sm">
                      {doc.vendorTotals.find((total) => total.vendorId === item.vendorId)
                        ?.vendorName ?? '-'}
                    </Text>
                  </Table.Td>
                )}
                <Table.Td>
                  <Text size="sm">{formatDay(item.bill.dueDate, currentLanguage)}</Text>
                </Table.Td>
                <Table.Td>
                  <StatusBadge status={item.bill.status as 'VERIFIED'} />
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm">{showAmounts ? formatAmount(item.amount) : '—'}</Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" fw={700}>
                    {showAmounts ? formatAmount(item.bill.remainingAmount) : '—'}
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
