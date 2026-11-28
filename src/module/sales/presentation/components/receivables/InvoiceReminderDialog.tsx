import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { IconDownload, IconSend } from '@tabler/icons-react';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import { validateReminderEmail } from '@/module/sales/domain/reminderEmail';
import { formatDate } from '@/module/sales/domain/saleFormat';
import { formatMoneyAt } from '@/utils/formatMoney';
import { downloadBlob } from '../../hooks/downloadBlob';
import { useReminderInvoicePdf } from '../../hooks/useReminderInvoicePdf';
import { useSaleDetail } from '../../hooks/useSaleQueries';
import { InvoiceReminderPreview } from './InvoiceReminderPreview';

export type ReminderTarget = { id: string; transactionNumber: string };

export function InvoiceReminderDialog({
  target,
  sending,
  onClose,
  onSend,
}: Readonly<{
  target: ReminderTarget;
  sending: boolean;
  onClose: () => void;
  onSend: (target: ReminderTarget & { email: string; message: string }) => void;
}>) {
  const { t } = useTranslation('salesReceivables');
  const sale = useSaleDetail(target.id);
  const pdf = useReminderInvoicePdf(target.id);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!sale.data || initialized) return;
    const invoice = sale.data;
    setEmail(invoice.emails[0] || invoice.customer?.emails?.[0] || '');
    setMessage(t('reminder.defaultMessage', {
      number: invoice.transactionNumber,
      amount: formatMoneyAt(invoice.remainingAmount, 2),
      due: formatDate(invoice.dueDate),
    }));
    setInitialized(true);
  }, [sale.data, initialized, t]);

  const invoice = sale.data;
  const emailIssue = validateReminderEmail(email);
  const canSend = Boolean(invoice && !emailIssue && message.trim() && !sending);

  return (
    <ModalFrame
      opened
      onClose={onClose}
      size="min(1000px, 94vw)"
      title={
        <Group gap="xs"><IconSend size={18} />{t('reminder.composeTitle')}</Group>
      }
      description={t('reminder.composeHelp')}
      footer={<>
        <Button variant="default" onClick={onClose}>{t('reminder.cancel')}</Button>
        <Button
          leftSection={<IconSend size={16} />}
          loading={sending}
          disabled={!canSend}
          onClick={() => onSend({ ...target, email: email.trim(), message: message.trim() })}
        >
          {t('reminder.confirmLabel')}
        </Button>
      </>}
    >
      {sale.isError && <Alert color="red" mb="md">{t('reminder.loadError')}</Alert>}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Stack gap="md">
          {sale.isLoading ? <Skeleton height={110} /> : invoice && (
            <SimpleGrid cols={2} spacing="xs">
              <div><Text size="xs" c="dimmed">{t('table.invoice')}</Text><Text size="sm" fw={600}>{invoice.transactionNumber}</Text></div>
              <div><Text size="xs" c="dimmed">{t('table.customer')}</Text><Text size="sm" fw={600}>{invoice.customer?.displayName || '—'}</Text></div>
              <div><Text size="xs" c="dimmed">{t('table.dueDate')}</Text><Text size="sm" fw={600}>{formatDate(invoice.dueDate)}</Text></div>
              <div><Text size="xs" c="dimmed">{t('table.invoiceTotal')}</Text><Text size="sm" fw={600}>{formatMoneyAt(invoice.finalAmount, 2)}</Text></div>
            </SimpleGrid>
          )}
          <TextInput
            type="email"
            label={t('reminder.recipient')}
            description={t('reminder.recipientHelp')}
            required
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            error={emailIssue ? t(`reminder.emailError.${emailIssue}`) : undefined}
          />
          <Textarea
            label={t('reminder.customerMessage')}
            minRows={8}
            maxRows={12}
            autosize
            value={message}
            onChange={(event) => setMessage(event.currentTarget.value)}
            maxLength={5000}
            required
          />
        </Stack>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" fw={600}>{t('reminder.attachment')}</Text>
            <Button
              size="compact-xs"
              variant="subtle"
              leftSection={<IconDownload size={14} />}
              disabled={!pdf.data}
              onClick={() => pdf.data && downloadBlob(pdf.data, `${target.transactionNumber}.pdf`)}
            >
              {t('reminder.download')}
            </Button>
          </Group>
          <Text size="xs" c="dimmed">{target.transactionNumber}.pdf</Text>
          <Paper withBorder radius="sm" bg="gray.0" h={370} style={{ overflow: 'hidden' }}>
            {invoice ? (
              <InvoiceReminderPreview invoice={invoice} />
            ) : (
              <Box p="md">
                {pdf.isError ? <Text size="sm" c="red">{t('reminder.pdfError')}</Text> : <Skeleton height={330} />}
              </Box>
            )}
          </Paper>
          <Text size="xs" c="dimmed">{t('reminder.previewFallback')}</Text>
        </Stack>
      </SimpleGrid>
    </ModalFrame>
  );
}
