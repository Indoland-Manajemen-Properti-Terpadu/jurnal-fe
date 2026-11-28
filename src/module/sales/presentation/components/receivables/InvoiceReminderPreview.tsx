import { Box, Group, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { Sale } from '@/module/sales/domain/sale';
import { formatDate } from '@/module/sales/domain/saleFormat';
import { formatMoneyAt } from '@/utils/formatMoney';

export function InvoiceReminderPreview({ invoice }: Readonly<{ invoice: Sale }>) {
  const { t } = useTranslation('salesReceivables');
  return (
    <Box bg="white" h="100%" style={{ overflowY: 'auto' }}>
      <Group justify="space-between" align="flex-start" bg="primary.9" p="md">
        <div>
          <Text size="sm" fw={700} c="white">{t('reminder.previewInvoice')}</Text>
          <Text size="xs" c="white">{invoice.customer?.displayName || '—'}</Text>
        </div>
        <Text size="xs" fw={600} c="white">{invoice.transactionNumber}</Text>
      </Group>
      <Stack gap="md" p="md">
        <Group justify="space-between" align="flex-start" gap="xs">
          <div><Text size="xs" c="dimmed">{t('table.customer')}</Text><Text size="xs" fw={600}>{invoice.customer?.displayName || '—'}</Text></div>
          <div><Text size="xs" c="dimmed">{t('table.date')}</Text><Text size="xs">{formatDate(invoice.transactionDate)}</Text></div>
          <div><Text size="xs" c="dimmed">{t('table.dueDate')}</Text><Text size="xs">{formatDate(invoice.dueDate)}</Text></div>
        </Group>
        <Table horizontalSpacing="xs" verticalSpacing="xs" striped>
          <Table.Thead bg="gray.0"><Table.Tr>
            <Table.Th>{t('reminder.previewItem')}</Table.Th>
            <Table.Th ta="right">{t('reminder.previewQuantity')}</Table.Th>
            <Table.Th ta="right">{t('table.invoiceTotal')}</Table.Th>
          </Table.Tr></Table.Thead>
          <Table.Tbody>
            {invoice.items.map((item, index) => <Table.Tr key={item.id || index}>
              <Table.Td><Text size="xs">{item.product?.name || item.description || '—'}</Text></Table.Td>
              <Table.Td ta="right"><Text size="xs">{item.quantity}</Text></Table.Td>
              <Table.Td ta="right"><Text size="xs" style={{ whiteSpace: 'nowrap' }}>{formatMoneyAt(item.amount, 2)}</Text></Table.Td>
            </Table.Tr>)}
          </Table.Tbody>
        </Table>
        <Stack gap={3} align="flex-end">
          <Text size="xs">{t('table.invoiceTotal')}: {formatMoneyAt(invoice.finalAmount, 2)}</Text>
          <Text size="xs">{t('table.settlement')}: {formatMoneyAt(invoice.paidAmount, 2)}</Text>
          <Text size="sm" fw={700}>{t('table.remaining')}: {formatMoneyAt(invoice.remainingAmount, 2)}</Text>
        </Stack>
      </Stack>
    </Box>
  );
}
