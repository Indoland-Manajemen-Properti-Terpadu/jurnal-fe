import { useEffect } from 'react';
import { Button, Group, Modal, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatDate } from '@/module/sales/domain/saleFormat';
import { formatMoneyAt } from '@/utils/formatMoney';
import { useReceivableCustomerDetail } from '../../hooks/useReceivablesWorkbench';

const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export function CustomerReminderDialog({
  customerId,
  customerName,
  onClose,
  onSelect,
}: Readonly<{
  customerId: string | null;
  customerName: string;
  onClose: () => void;
  onSelect: (invoice: { id: string; transactionNumber: string }) => void;
}>) {
  const { t } = useTranslation('salesReceivables');
  const detail = useReceivableCustomerDetail(customerId || undefined);
  const invoices = detail.data?.invoices.data.filter(
    (invoice) =>
      invoice.remainingAmount > 0 &&
      Boolean(invoice.dueDate && invoice.dueDate.slice(0, 10) < localToday())
  ) ?? [];

  useEffect(() => {
    if (customerId && !detail.data?.invoices.pagination.hasMore && invoices.length === 1) {
      onSelect({ id: invoices[0].id, transactionNumber: invoices[0].transactionNumber });
    }
  }, [customerId, detail.data, invoices.length, onSelect]);

  return (
    <Modal
      opened={Boolean(customerId)}
      onClose={onClose}
      title={t('reminder.customerTitle', { name: customerName })}
      size="lg"
    >
      <Stack gap="sm">
        <Text size="sm" c="dimmed">{t('reminder.customerHelp')}</Text>
        {detail.isLoading && <Skeleton height={74} />}
        {detail.isError && <Text size="sm" c="red">{t('reminder.loadError')}</Text>}
        {!detail.isLoading && !detail.isError && invoices.length === 0 && (
          <Text size="sm" c="dimmed">{t('reminder.noOverdue')}</Text>
        )}
        {invoices.map((invoice) => (
          <Paper key={invoice.id} withBorder radius="md" p="sm">
            <Group justify="space-between" align="center" gap="sm" wrap="wrap">
              <div>
                <Text size="sm" fw={600}>{invoice.transactionNumber}</Text>
                <Text size="xs" c="dimmed">
                  {t('reminder.invoiceMeta', {
                    due: formatDate(invoice.dueDate),
                    amount: formatMoneyAt(invoice.remainingAmount, detail.data?.precision ?? 2),
                  })}
                </Text>
              </div>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconSend size={15} />}
                onClick={() => onSelect({ id: invoice.id, transactionNumber: invoice.transactionNumber })}
              >
                {t('actions.sendReminder')}
              </Button>
            </Group>
          </Paper>
        ))}
        {detail.data?.invoices.pagination.hasMore && (
          <Text size="xs" c="dimmed">{t('reminder.moreInvoices')}</Text>
        )}
      </Stack>
    </Modal>
  );
}
