import { useState } from 'react';
import { Box, Button, Group, Loader, Table, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import { formatDate, formatIDR } from '@/module/sales/domain/saleFormat';
import { useSales } from '../../hooks/useSaleQueries';
import { SaleStatusBadge } from '../shared/SaleStatusBadge';

interface InvoicePickerDialogProps {
  opened: boolean;
  onClose: () => void;
  onPick: (saleId: string) => void;
}

const num = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } as const;

/** Picks the issued invoice a return corrects; a row is the whole target, there is no button. */
export function InvoicePickerDialog({
  opened,
  onClose,
  onPick,
}: Readonly<InvoicePickerDialogProps>) {
  const { t } = useTranslation('salesReturns');
  const [input, setInput] = useState('');
  const [search] = useDebouncedValue(input, 350);
  const query = useSales({
    paymentStatus: ['UNPAID', 'OVERDUE', 'PAID'],
    search: search.trim() || undefined,
    limit: 10,
    sortBy: 'transactionDate',
    sortOrder: 'desc',
  });
  const invoices = query.data?.items ?? [];

  return (
    <ModalFrame
      opened={opened}
      onClose={onClose}
      size="min(1080px, 94vw)"
      title={t('picker.title')}
      description={t('picker.intro')}
      bodyPadding={0}
      headerExtra={
        <TextInput
          placeholder={t('picker.search')}
          aria-label={t('picker.search')}
          leftSection={<IconSearch size={16} />}
          value={input}
          onChange={(event) => setInput(event.currentTarget.value)}
          data-autofocus
        />
      }
      footer={
        <Button variant="default" onClick={onClose}>
          {t('picker.cancel')}
        </Button>
      }
    >
      {query.isLoading && (
        <Group justify="center" py="md">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            {t('picker.loading')}
          </Text>
        </Group>
      )}
      {query.isError && (
        <Text size="sm" c="red.7" px="lg">
          {t('picker.error')}
        </Text>
      )}
      {!query.isLoading && !query.isError && invoices.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="md">
          {t('picker.empty')}
        </Text>
      )}
      {invoices.length > 0 && (
        <Box style={{ overflow: 'auto', maxHeight: 'min(60vh, 640px)' }}>
          <Table
            verticalSpacing="sm"
            horizontalSpacing="lg"
            highlightOnHover
            stickyHeader
            miw={760}
          >
            <Table.Thead bg="gray.0" style={{ boxShadow: '0 1px 0 var(--mantine-color-gray-3)' }}>
              <Table.Tr>
                <Table.Th>{t('picker.colNumber')}</Table.Th>
                <Table.Th>{t('picker.colDate')}</Table.Th>
                <Table.Th ta="right">{t('picker.colTotal')}</Table.Th>
                <Table.Th ta="right" style={{ whiteSpace: 'nowrap' }}>
                  {t('picker.colBalance')}
                </Table.Th>
                <Table.Th ta="center">{t('picker.colStatus')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {invoices.map((invoice) => (
                <Table.Tr
                  key={invoice.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`${t('picker.pick')} ${invoice.transactionNumber}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onPick(invoice.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onPick(invoice.id);
                    }
                  }}
                >
                  <Table.Td>
                    <Text size="sm" fw={600}>
                      {invoice.transactionNumber}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {invoice.customer?.displayName || '–'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
                      {formatDate(invoice.transactionDate)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right" style={num}>
                    <Text size="sm">{formatIDR(invoice.finalAmount)}</Text>
                  </Table.Td>
                  <Table.Td ta="right" style={num}>
                    <Text size="sm" c={invoice.remainingAmount > 0 ? undefined : 'dimmed'}>
                      {formatIDR(invoice.remainingAmount)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Group justify="center">
                      <SaleStatusBadge status={invoice.displayStatus} />
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      )}
    </ModalFrame>
  );
}
