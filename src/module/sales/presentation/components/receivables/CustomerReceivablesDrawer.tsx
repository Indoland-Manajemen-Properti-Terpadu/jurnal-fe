import { ActionIcon, Anchor, Box, Button, Divider, Drawer, Group, Menu, Paper, ScrollArea, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconCash, IconDotsVertical, IconEye, IconReceipt2, IconUser } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import type { ReceivableAgingKey, ReceivableCustomerDetail } from '@/module/sales/domain/saleReceivables';
import { formatCount, formatDate } from '@/module/sales/domain/saleFormat';
import { formatMoneyAt } from '@/utils/formatMoney';
import { useReceivableCustomerDetail } from '../../hooks/useReceivablesWorkbench';

export type CustomerInvoiceAction = {
  id: string;
  transactionNumber: string;
  customerId: string;
  customerName: string;
  transactionDate: string | null;
  dueDate: string | null;
  finalAmount: number;
  remainingAmount: number;
  saleOrderId: string | null;
};

const agingKeys: { key: ReceivableAgingKey; color: string }[] = [
  { key: 'current', color: 'green.6' },
  { key: 'days1to30', color: 'yellow.6' },
  { key: 'days31to60', color: 'orange.6' },
  { key: 'days61to90', color: 'red.5' },
  { key: 'over90', color: 'red.8' },
];

const daysUntilDue = (dueDate: string | null): number | null => {
  if (!dueDate) return null;
  const due = Date.parse(`${dueDate.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(due)) return null;
  const now = new Date();
  return Math.round((due - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86_400_000);
};

export function CustomerReceivablesDrawer({
  customerId, opened, onClose, canViewInvoices, canRecordPayment,
  onViewInvoice, onPay, onContact, onPayments,
}: Readonly<{
  customerId: string | null;
  opened: boolean;
  onClose: () => void;
  canViewInvoices: boolean;
  canRecordPayment: boolean;
  onViewInvoice: (invoice: CustomerInvoiceAction) => void;
  onPay: (invoice: CustomerInvoiceAction) => void;
  onContact: (id: string) => void;
  onPayments: () => void;
}>) {
  const { t } = useTranslation('salesReceivables');
  const query = useReceivableCustomerDetail(opened ? customerId || undefined : undefined);
  const { data } = query;
  const invoiceAction = (invoice: ReceivableCustomerDetail['invoices']['data'][number]): CustomerInvoiceAction => ({
    id: invoice.id,
    transactionNumber: invoice.transactionNumber,
    customerId: data?.customer.id || '',
    customerName: data?.customer.displayName || data?.customer.name || '',
    transactionDate: invoice.transactionDate,
    dueDate: invoice.dueDate,
    finalAmount: invoice.finalAmount,
    remainingAmount: invoice.remainingAmount,
    saleOrderId: invoice.saleOrderId,
  });

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={620}
      title={<Group gap="xs"><IconUser size={19} /><Text fw={700}>{data?.customer.displayName || data?.customer.name || t('drawer.title')}</Text></Group>}
    >
      <ScrollArea h="calc(100vh - 90px)" offsetScrollbars>
        {query.isLoading && <Stack gap="md"><Skeleton height={115} /><Skeleton height={170} /><Skeleton height={190} /></Stack>}
        {!query.isLoading && query.isError && (
          <EmptyState title={t('drawer.errorTitle')} description={t('drawer.errorDescription')} actionLabel={t('drawer.retry')} onAction={() => query.refetch()} />
        )}
        {!query.isLoading && !query.isError && data && (
          <Stack gap="lg" pb="lg">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Group gap="xl" align="flex-start">
                <div>
                  <Text size="xs" c="dimmed">{t('drawer.totalReceivable')}</Text>
                  <Text fw={700} fz="lg">{formatMoneyAt(data.totalReceivable, data.precision)}</Text>
                  <Text size="xs" c="dimmed">{t('drawer.openInvoiceCount', { count: formatCount(data.invoices.pagination.total) })}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">{t('drawer.creditAvailable')}</Text>
                  <Text fw={700}>{data.creditAvailable > 0 ? formatMoneyAt(data.creditAvailable, data.precision) : '—'}</Text>
                  {data.creditAvailable <= 0 && <Text size="xs" c="dimmed">{t('drawer.noCredit')}</Text>}
                </div>
              </Group>
              <Button size="compact-xs" variant="default" radius="xl" onClick={() => onContact(data.customer.id)}>{t('actions.openContact')}</Button>
            </Group>

            <Stack gap="xs">
              <Box h={8} bg="gray.1" style={{ display: 'flex', overflow: 'hidden', borderRadius: 99 }}>
                {agingKeys.map(({ key, color }) => data.aging[key].amount > 0 && (
                  <Box key={key} bg={color} w={`${data.totalReceivable ? (data.aging[key].amount / data.totalReceivable) * 100 : 0}%`} />
                ))}
              </Box>
              {agingKeys.map(({ key, color }) => (
                <Group key={key} justify="space-between" gap="xs">
                  <Group gap="xs"><Box w={8} h={8} bg={color} style={{ borderRadius: '50%' }} /><Text size="xs" c="dimmed">{t(`aging.${key}`)}</Text></Group>
                  <Text size="xs" fw={500} c={data.aging[key].amount ? undefined : 'dimmed'}>{data.aging[key].amount ? formatMoneyAt(data.aging[key].amount, data.precision) : '—'}</Text>
                </Group>
              ))}
            </Stack>

            <Divider />
            <section>
              <Text fw={700} size="sm" mb="sm">{t('drawer.openInvoices')}</Text>
              <Paper withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
                <Table horizontalSpacing="sm" verticalSpacing="sm">
                  <Table.Thead bg="gray.0"><Table.Tr>
                    <Table.Th miw={210}>{t('table.invoice')}</Table.Th>
                    <Table.Th miw={100}>{t('table.dueDate')}</Table.Th>
                    <Table.Th ta="right">{t('table.remaining')}</Table.Th>
                    <Table.Th w={34} />
                  </Table.Tr></Table.Thead>
                  <Table.Tbody>
                    {data.invoices.data.map((invoice) => {
                      const action = invoiceAction(invoice);
                      const days = daysUntilDue(invoice.dueDate);
                      return <Table.Tr key={invoice.id}>
                        <Table.Td><Stack gap={1}>
                          {canViewInvoices ? <Anchor component="button" type="button" ta="left" size="sm" fw={600} onClick={() => onViewInvoice(action)}>{invoice.transactionNumber}</Anchor> : <Text size="sm" fw={600}>{invoice.transactionNumber}</Text>}
                          {days != null && <Text size="xs" c="dimmed">{days < 0 ? t('table.daysOverdue', { count: formatCount(-days) }) : t('table.daysUntilDue', { count: formatCount(days) })}</Text>}
                        </Stack></Table.Td>
                        <Table.Td><Text size="xs">{formatDate(invoice.dueDate)}</Text></Table.Td>
                        <Table.Td ta="right"><Text size="xs" fw={600} style={{ whiteSpace: 'nowrap' }}>{formatMoneyAt(invoice.remainingAmount, data.precision)}</Text></Table.Td>
                        <Table.Td><Menu position="bottom-end" shadow="md">
                          <Menu.Target><ActionIcon variant="subtle" color="gray" aria-label={t('table.actions')}><IconDotsVertical size={16} /></ActionIcon></Menu.Target>
                          <Menu.Dropdown>
                            {canViewInvoices && <Menu.Item leftSection={<IconEye size={15} />} onClick={() => onViewInvoice(action)}>{t('actions.viewInvoice')}</Menu.Item>}
                            {canRecordPayment && <Menu.Item leftSection={<IconCash size={15} />} onClick={() => onPay(action)}>{t('actions.recordPayment')}</Menu.Item>}
                          </Menu.Dropdown>
                        </Menu></Table.Td>
                      </Table.Tr>;
                    })}
                    {data.invoices.data.length === 0 && <Table.Tr><Table.Td colSpan={4}><Text size="sm" c="dimmed">{t('drawer.noInvoices')}</Text></Table.Td></Table.Tr>}
                  </Table.Tbody>
                </Table>
              </Paper>
              {data.invoices.pagination.hasMore && <Text size="xs" c="dimmed" mt="xs">{t('drawer.invoiceLimit', { count: data.invoices.pagination.limit })}</Text>}
            </section>

            <section>
              <Group justify="space-between" mb="sm">
                <Text fw={700} size="sm">{t('drawer.recentPayments')}</Text>
                <Button variant="subtle" size="compact-xs" onClick={onPayments}>{t('drawer.paymentsLink')}</Button>
              </Group>
              {data.payments.length === 0 ? (
                <Paper radius="md" p="sm" bg="gray.0"><Group gap="xs"><IconReceipt2 size={16} /><Text size="xs" c="dimmed">{t('drawer.noPayments')}</Text></Group></Paper>
              ) : <Stack gap="xs">
                {data.payments.map((payment) => <Group key={payment.id} justify="space-between" wrap="nowrap">
                  <div><Text size="sm" fw={600}>{payment.invoiceNumber || payment.transactionNumber}</Text><Text size="xs" c="dimmed">{formatDate(payment.paymentDate)}</Text></div>
                  <Text size="sm" fw={600}>{formatMoneyAt(payment.amount, data.precision)}</Text>
                </Group>)}
              </Stack>}
            </section>
          </Stack>
        )}
      </ScrollArea>
    </Drawer>
  );
}
