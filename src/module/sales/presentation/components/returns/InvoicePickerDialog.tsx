import { useState } from 'react';
import { Button, Group, Loader, Modal, Stack, Table, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatDate, formatIDR } from '@/module/sales/domain/saleFormat';
import { useSales } from '../../hooks/useSaleQueries';

interface InvoicePickerDialogProps {
  opened: boolean;
  onClose: () => void;
  onPick: (saleId: string) => void;
}

/** Picks the issued invoice a return corrects; draft and void invoices are not offered. */
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
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      size="lg"
      title={t('picker.title')}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('picker.intro')}
        </Text>
        <TextInput
          placeholder={t('picker.search')}
          aria-label={t('picker.search')}
          leftSection={<IconSearch size={16} />}
          value={input}
          onChange={(event) => setInput(event.currentTarget.value)}
          data-autofocus
        />
        {query.isLoading && (
          <Group justify="center" py="md">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">
              {t('picker.loading')}
            </Text>
          </Group>
        )}
        {query.isError && (
          <Text size="sm" c="red.7">
            {t('picker.error')}
          </Text>
        )}
        {!query.isLoading && !query.isError && invoices.length === 0 && (
          <Text size="sm" c="dimmed" ta="center" py="md">
            {t('picker.empty')}
          </Text>
        )}
        {invoices.length > 0 && (
          <Table.ScrollContainer minWidth={480}>
            <Table verticalSpacing="xs" horizontalSpacing="sm" highlightOnHover>
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th>{t('picker.colNumber')}</Table.Th>
                  <Table.Th>{t('picker.colCustomer')}</Table.Th>
                  <Table.Th ta="right">{t('picker.colTotal')}</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {invoices.map((invoice) => (
                  <Table.Tr key={invoice.id}>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        {invoice.transactionNumber}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDate(invoice.transactionDate)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{invoice.customer?.displayName || '–'}</Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatIDR(invoice.finalAmount)}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Button size="xs" variant="light" onClick={() => onPick(invoice.id)}>
                        {t('picker.pick')}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            {t('picker.cancel')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
