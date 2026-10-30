import { Alert, Button, Group, Paper, Stack, Tabs, Text, TextInput } from '@mantine/core';
import { IconDownload, IconInfoCircle, IconSearch, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import {
  TRANSACTION_STATUS_FILTERS,
  type TransactionStatusFilter,
} from '@/module/contacts/domain/contactTransactions';
import { TableTransactionByContact } from '@/module/contacts/presentation/components/tables/TableTransactionByContact';
import type { useContactTransactionView } from '@/module/contacts/presentation/hooks/useContactTransactionView';
import classes from '@/module/contacts/presentation/pages/DetailContactPage.module.css';

type Props = {
  contactId: string | undefined;
  search: string;
  status: TransactionStatusFilter;
  page: number;
  limit: number;
  transactions: ReturnType<typeof useContactTransactionView>;
  isExporting: boolean;
  onExport: () => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string | null) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

/** Invoice list of one contact: search, status tabs, table and the truncated-list notice. */
export function ContactTransactionsPanel({
  contactId,
  search,
  status,
  page,
  limit,
  transactions,
  isExporting,
  onExport,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onLimitChange,
}: Readonly<Props>) {
  const navigate = useNavigate();
  const { t } = useTranslation('contactDetail');

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" gap="md">
          <div>
            <Text fw={700} fz="lg">
              {t('transactionsTitle')}
            </Text>
            <Text fz="sm" c="dimmed">
              {t('transactionsDescription')}
            </Text>
          </div>
          <Group gap="xs" className={classes.transactionActions}>
            <Button
              variant="default"
              leftSection={<IconDownload size={16} />}
              loading={isExporting}
              onClick={onExport}
            >
              {t('exportTransactions')}
            </Button>
            {contactId && (
              <Button
                variant="light"
                onClick={() =>
                  navigate(
                    routes.Contact.TransactionDetailByContact.replace(':idAccount', contactId)
                  )
                }
              >
                {t('allTransactions')}
              </Button>
            )}
          </Group>
        </Group>
        {transactions.isLimited && (
          <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />}>
            {t('invoiceLimitNote')}
          </Alert>
        )}
        <TextInput
          aria-label={t('searchInvoices')}
          placeholder={t('searchInvoices')}
          leftSection={<IconSearch size={16} />}
          rightSection={
            search ? (
              <Button
                variant="subtle"
                size="compact-xs"
                onClick={() => onSearchChange('')}
                aria-label={t('clearSearch')}
              >
                <IconX size={14} />
              </Button>
            ) : null
          }
          value={search}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
        />
        <Tabs value={status} onChange={onStatusChange} variant="pills" radius="md" color="primary">
          <Tabs.List className={classes.tabList}>
            {TRANSACTION_STATUS_FILTERS.map((value) => (
              <Tabs.Tab key={value} value={value}>
                {t(`status.${value}`)}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
        {transactions.query.isError ? (
          <Alert color="red" title={t('transactionsError')} icon={<IconInfoCircle size={18} />}>
            <Button
              variant="light"
              size="xs"
              color="red"
              mt="xs"
              onClick={() => transactions.query.refetch()}
            >
              {t('retry')}
            </Button>
          </Alert>
        ) : (
          <TableTransactionByContact
            transactions={transactions.items}
            isLoading={transactions.query.isLoading || transactions.query.isFetching}
            page={page}
            limit={limit}
            total={transactions.filteredCount}
            totalPages={transactions.totalPages}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        )}
      </Stack>
    </Paper>
  );
}
