import { useEffect } from 'react';
import { Alert, Button, Group, Paper, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconAlertCircle, IconCashBanknote } from '@tabler/icons-react';
import { DetailCardHeader } from '@/components/DetailCardHeader/DetailCardHeader';
import type { Sale } from '@/module/sales/domain/sale';
import type { SalePaymentRow } from '@/module/sales/domain/salePaymentList';
import { fromCents, toCents } from '@/module/sales/domain/saleMoney';
import type { SaleDisplay } from '../../hooks/useSaleDisplay';
import { useSalePaymentsOfSale } from '../../hooks/useSaleQueries';
import classes from './SaleDetail.module.css';

type SalePaymentHistoryCardProps = {
  sale: Sale;
  display: SaleDisplay;
  /** A payment to mark, when the user came from the payments list. */
  highlightId?: string;
};

/** Every payment received on the invoice, with where each one was allocated. */
export function SalePaymentHistoryCard({
  sale,
  display,
  highlightId,
}: Readonly<SalePaymentHistoryCardProps>) {
  const { t, money, date } = display;
  const query = useSalePaymentsOfSale(sale.id);
  const rows = query.data?.items ?? [];

  useEffect(() => {
    if (!highlightId || rows.length === 0) return;
    document.getElementById(`payment-${highlightId}`)?.scrollIntoView({ block: 'nearest' });
  }, [highlightId, rows.length]);

  const lineNames = new Map(
    sale.items.map((item) => [
      item.id ?? item._id ?? '',
      item.product?.name || item.description || '—',
    ])
  );
  const received = fromCents(rows.reduce((sum, row) => sum + toCents(row.amount), 0));

  const allocation = (row: SalePaymentRow) => {
    const parts = row.items.map((item) => ({
      key: item.saleItem ?? `${item.amount}`,
      name: (item.saleItem && lineNames.get(item.saleItem)) || '—',
      amount: item.amount,
    }));
    if (row.lateFeeAmount > 0) {
      parts.push({ key: 'late-fee', name: t('lateFee'), amount: row.lateFeeAmount });
    }
    return parts;
  };

  let body;
  if (query.isLoading) {
    body = (
      <Stack gap="xs" aria-busy="true">
        <Skeleton height={36} radius="md" />
        <Skeleton height={36} radius="md" />
      </Stack>
    );
  } else if (query.isError) {
    body = (
      <Alert color="gray" variant="light" icon={<IconAlertCircle size={18} />} radius="md">
        <Group justify="space-between" gap="sm">
          <Text size="sm">{t('paymentsError')}</Text>
          <Button size="xs" variant="default" onClick={() => query.refetch()}>
            {t('paymentsRetry')}
          </Button>
        </Group>
      </Alert>
    );
  } else if (rows.length === 0) {
    body = (
      <Text size="sm" c="dimmed">
        {t('paymentsEmpty')}
      </Text>
    );
  } else {
    body = (
      <Table.ScrollContainer minWidth={560}>
        <Table verticalSpacing="sm" horizontalSpacing="sm">
          <Table.Thead className={classes.tableHead}>
            <Table.Tr>
              <Table.Th>{t('colPaymentDate')}</Table.Th>
              <Table.Th>{t('colPayment')}</Table.Th>
              <Table.Th>{t('colAllocation')}</Table.Th>
              <Table.Th ta="right">{t('colReceived')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row) => (
              <Table.Tr
                key={row.id}
                id={`payment-${row.id}`}
                aria-current={row.id === highlightId ? 'true' : undefined}
                bg={row.id === highlightId ? 'primary.0' : undefined}
              >
                <Table.Td className={classes.amount}>{date(row.paymentDate)}</Table.Td>
                <Table.Td>
                  <Text size="sm" fw={700}>
                    {row.transactionNumber}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {[row.paymentMethodName, row.depositAccountName].filter(Boolean).join(' · ') ||
                      '—'}
                  </Text>
                  {row.memo && (
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {row.memo}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Stack gap={2}>
                    {allocation(row).map((part) => (
                      <Group key={part.key} justify="space-between" gap="md" wrap="nowrap">
                        <Text size="xs">{part.name}</Text>
                        <Text size="xs" c="dimmed" className={classes.amount}>
                          {money(part.amount)}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Table.Td>
                <Table.Td ta="right" className={classes.amount}>
                  <Text size="sm" fw={700}>
                    {money(row.amount)}
                  </Text>
                  {row.overpaymentAmount > 0 && (
                    <Text size="xs" c="dimmed">
                      {t('paymentsExcess', { amount: money(row.overpaymentAmount) })}
                    </Text>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    );
  }

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
      <DetailCardHeader
        icon={<IconCashBanknote size={19} />}
        title={t('paymentsTitle')}
        subtitle={
          rows.length > 0
            ? t('paymentsSubtitle', { count: rows.length, amount: money(received) })
            : t('paymentsSubtitleEmpty')
        }
      />
      {body}
    </Paper>
  );
}

export default SalePaymentHistoryCard;
