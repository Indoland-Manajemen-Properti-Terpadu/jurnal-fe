import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconDownload,
  IconFilterOff,
  IconChartBar,
  IconReceipt2,
  IconSearch,
  IconUser,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { CreateSalePaymentPayload, Sale } from '../../domain/sale';
import { formatCount, formatDate } from '../../domain/saleFormat';
import type {
  ReceivableAgingFilter,
  ReceivableCustomerRow,
  ReceivableInvoiceRow,
  ReceivableListParams,
  ReceivableView,
} from '../../domain/saleReceivables';
import { downloadReceivablesCsv } from '../../infrastructure/saleReceivablesWorkbenchApi';
import { downloadBlob } from '../hooks/downloadBlob';
import {
  useCreateSalePayment,
  useCopyInvoiceLink,
} from '../hooks/useSaleMutations';
import { useSaleNotifier } from '../hooks/useSaleNotifier';
import {
  useReceivableCustomers,
  useReceivableInvoices,
  useReceivablesOverview,
  receivablesWorkbenchKeys,
} from '../hooks/useReceivablesWorkbench';
import { useReceivableRights } from '../hooks/useReceivableRights';
import { CustomerPicker } from '../components/shared/CustomerPicker';
import { PaySaleModal } from '../components/PaySaleModal';
import {
  CustomerReceivablesDrawer,
  type CustomerInvoiceAction,
} from '../components/receivables/CustomerReceivablesDrawer';
import { ReceivableCustomersTable } from '../components/receivables/ReceivableTables';
import { ReceivableInvoicesTable } from '../components/receivables/ReceivableInvoicesTable';
import { ReceivablesSummary } from '../components/receivables/ReceivablesSummary';
import { ReceivablesReminderControls } from '../components/receivables/ReceivablesReminderControls';
import { resolveInvoiceJournalPath } from '../components/receivables/resolveInvoiceJournalPath';

const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

type PaymentTarget = Pick<
  Sale,
  | 'id'
  | 'transactionNumber'
  | 'transactionDate'
  | 'finalAmount'
  | 'remainingAmount'
  | 'outstandingLateFee'
  | 'items'
> & {
  customer: { id: string; displayName: string } | null;
};

const toPaymentTarget = (row: ReceivableInvoiceRow | CustomerInvoiceAction): PaymentTarget => {
  const customer =
    'customerId' in row
      ? { id: row.customerId, displayName: row.customerName }
      : { id: row.customer?.id || '', displayName: row.customer?.name || '' };
  return {
    id: row.id,
    transactionNumber: row.transactionNumber,
    transactionDate: row.transactionDate,
    finalAmount: row.finalAmount,
    remainingAmount: row.remainingAmount,
    outstandingLateFee: 'outstandingLateFee' in row ? row.outstandingLateFee : 0,
    customer,
    items: [],
  };
};

const invoicePath = (id: string) => routes.sales.detail.replace(':id', id);

export default function ReceivablesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation('salesReceivables');
  const rights = useReceivableRights();
  const notify = useSaleNotifier();

  const [view, setView] = useState<ReceivableView>('customers');
  const [asOf] = useState(localToday);
  const [searchInput, setSearchInput] = useState('');
  const [search] = useDebouncedValue(searchInput, 350);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [aging, setAging] = useState<ReceivableAgingFilter | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [detailCustomerId, setDetailCustomerId] = useState<string | null>(null);
  const [reminderCustomer, setReminderCustomer] = useState<ReceivableCustomerRow | null>(null);
  const [reminderInvoice, setReminderInvoice] = useState<ReceivableInvoiceRow | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<PaymentTarget | null>(null);

  const overview = useReceivablesOverview(asOf, rights.canRead);
  const params = useMemo<ReceivableListParams>(
    () => ({
      page,
      limit,
      search: search.trim() || undefined,
      customer: customerId || undefined,
      aging: aging || undefined,
      sortBy: view === 'customers' ? 'total' : 'dueDate',
      sortOrder: view === 'customers' ? 'desc' : 'asc',
    }),
    [page, limit, search, customerId, aging, view]
  );
  const customers = useReceivableCustomers(params, rights.canRead && view === 'customers');
  const invoices = useReceivableInvoices(params, rights.canRead && view === 'invoices');
  const paymentMutation = useCreateSalePayment();
  const copyLinkMutation = useCopyInvoiceLink();

  useEffect(() => setPage(1), [view, search, customerId, aging, limit]);

  const current = view === 'customers' ? customers : invoices;
  const rows = view === 'customers' ? (customers.data?.data ?? []) : (invoices.data?.data ?? []);
  const pagination = current.data?.pagination;
  const invalidateWorkbench = async () => {
    await queryClient.invalidateQueries({ queryKey: receivablesWorkbenchKeys.all });
  };

  const submitPayment = async (payload: CreateSalePaymentPayload) => {
    const result = await paymentMutation.mutateAsync(payload);
    await invalidateWorkbench();
    return result;
  };

  const changeAging = (value: string | null) => {
    setAging((value as ReceivableAgingFilter | null) || null);
    setView('invoices');
  };

  const openInvoiceJournal = async (row: ReceivableInvoiceRow) => {
    try {
      navigate(await resolveInvoiceJournalPath(row.id));
    } catch (error) {
      notify.failure(error);
    }
  };

  const exportCsv = async () => {
    try {
      const blob = await downloadReceivablesCsv(view, {
        search: searchInput.trim() || undefined,
        customer: customerId || undefined,
        aging: aging || undefined,
        sortBy: view === 'customers' ? 'total' : 'dueDate',
        sortOrder: view === 'customers' ? 'desc' : 'asc',
      });
      downloadBlob(blob, `piutang-${view}-${localToday()}.csv`);
    } catch (error) {
      notify.failure(error);
    }
  };

  const retry = () => current.refetch();

  if (rights.isReady && !rights.canRead) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <EmptyState
            icon={<IconAlertCircle size={32} />}
            title={t('access.title')}
            description={t('access.description')}
          />
        </Box>
      </AppShellLayout>
    );
  }

  return (
    <AppShellLayout>
      <Box>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconChartBar}
            title={t('page.title')}
            description={t('page.description', { date: formatDate(asOf) })}
            actions={
              <Tooltip label={t('page.exportTooltip')} withArrow>
                <Button
                  variant="default"
                  leftSection={<IconDownload size={16} />}
                  onClick={exportCsv}
                  loading={current.isFetching}
                  disabled={!current.data || current.data.pagination.total === 0}
                >
                  {t('page.export')}
                </Button>
              </Tooltip>
            }
          />

          {overview.isError && (
            <Alert color="orange" title={t('summary.loadError')} withCloseButton={false}>
              <Group justify="space-between">
                <Text size="sm">{t('summary.loadErrorDescription')}</Text>
                <Button size="xs" variant="default" onClick={() => overview.refetch()}>
                  {t('table.retry')}
                </Button>
              </Group>
            </Alert>
          )}

          <ReceivablesSummary
            overview={overview.data}
            loading={overview.isLoading || overview.isError}
            asOf={asOf}
            onAgingClick={changeAging}
          />

          <Paper withBorder radius="lg" p={0} bg="white">
            <Box
              px="md"
              py="sm"
              style={{ borderBottom: '1px solid var(--jurnal-color-border-subtle)' }}
            >
              <Group gap="xs">
                <Button
                  size="xs"
                  radius="md"
                  variant={view === 'customers' ? 'light' : 'subtle'}
                  color="primary"
                  leftSection={<IconUser size={15} />}
                  aria-pressed={view === 'customers'}
                  onClick={() => setView('customers')}
                >
                  {t('tabs.customers', {
                    count: formatCount(overview.data?.summary.customerCount || 0),
                  })}
                </Button>
                <Button
                  size="xs"
                  radius="md"
                  variant={view === 'invoices' ? 'light' : 'subtle'}
                  color="primary"
                  leftSection={<IconReceipt2 size={15} />}
                  aria-pressed={view === 'invoices'}
                  onClick={() => setView('invoices')}
                >
                  {t('tabs.invoices', {
                    count: formatCount(overview.data?.summary.total.count || 0),
                  })}
                </Button>
              </Group>
            </Box>
            <Group
              px="md"
              py="sm"
              gap="sm"
              align="flex-start"
              wrap="wrap"
              style={{ borderBottom: '1px solid var(--jurnal-color-border-subtle)' }}
            >
              <TextInput
                leftSection={<IconSearch size={16} />}
                placeholder={t('filters.searchPlaceholder')}
                w={{ base: '100%', sm: 320 }}
                maxLength={100}
                value={searchInput}
                onChange={(event) => setSearchInput(event.currentTarget.value)}
              />
              <CustomerPicker
                value={customerId}
                onChange={(id) => setCustomerId(id)}
                onResolved={() => undefined}
                placeholder={t('filters.customerPlaceholder')}
                width={{ base: '100%', sm: 220 }}
              />
              <Select
                clearable
                placeholder={t('filters.agingPlaceholder')}
                w={{ base: '100%', sm: 210 }}
                data={[
                  { value: 'current', label: t('aging.current') },
                  { value: 'dueNext7', label: t('aging.dueNext7') },
                  { value: 'days1to30', label: t('aging.days1to30') },
                  { value: 'days31to60', label: t('aging.days31to60') },
                  { value: 'days61to90', label: t('aging.days61to90') },
                  { value: 'over90', label: t('aging.over90') },
                  { value: 'overdue', label: t('aging.overdue') },
                ]}
                value={aging}
                onChange={changeAging}
              />
            </Group>
            {(searchInput || customerId || aging) && (
              <Group justify="flex-end" px="md" pt="xs">
                <Button
                  size="xs"
                  variant="subtle"
                  leftSection={<IconFilterOff size={14} />}
                  onClick={() => {
                    setSearchInput('');
                    setCustomerId(null);
                    setAging(null);
                  }}
                >
                  {t('filters.clear')}
                </Button>
              </Group>
            )}

            <Box p="md">
              {view === 'customers' ? (
                <ReceivableCustomersTable
                  rows={rows as ReceivableCustomerRow[]}
                  loading={customers.isLoading}
                  error={customers.isError}
                  onRetry={retry}
                  precision={customers.data?.precision ?? overview.data?.precision ?? 2}
                  paging={{
                    page,
                    limit,
                    totalPages: pagination?.totalPages ?? 1,
                    total: pagination?.total ?? 0,
                    onPage: setPage,
                    onLimit: setLimit,
                  }}
                  actions={{
                    canSendReminder: rights.canSendInvoiceEmail,
                    onDetail: (row) => setDetailCustomerId(row.customer.id),
                    onReminder: setReminderCustomer,
                    onContact: (row) => navigate(routes.contacts.detail.replace(':idAccount', row.customer.id)),
                  }}
                />
              ) : (
                <ReceivableInvoicesTable
                  rows={rows as ReceivableInvoiceRow[]}
                  loading={invoices.isLoading}
                  error={invoices.isError}
                  onRetry={retry}
                  precision={invoices.data?.precision ?? overview.data?.precision ?? 2}
                  paging={{
                    page,
                    limit,
                    totalPages: pagination?.totalPages ?? 1,
                    total: pagination?.total ?? 0,
                    onPage: setPage,
                    onLimit: setLimit,
                  }}
                  actions={{
                    canView: rights.canViewInvoices,
                    canPay: rights.canRecordPayment,
                    canRemind: rights.canSendInvoiceEmail,
                    canCopyLink: rights.canRecordPayment,
                    onView: (row) => navigate(invoicePath(row.id)),
                    onCustomer: (id) => setDetailCustomerId(id),
                    onPay: (row) => setPaymentTarget(toPaymentTarget(row)),
                    onRemind: setReminderInvoice,
                    onCopyLink: (row) => copyLinkMutation.mutate(row.id),
                    onJournal: openInvoiceJournal,
                  }}
                />
              )}
            </Box>
          </Paper>
        </Stack>
      </Box>

      <CustomerReceivablesDrawer
        customerId={detailCustomerId}
        opened={Boolean(detailCustomerId)}
        onClose={() => setDetailCustomerId(null)}
        canViewInvoices={rights.canViewInvoices}
        canRecordPayment={rights.canRecordPayment}
        onViewInvoice={(invoice) => navigate(invoicePath(invoice.id))}
        onPay={(invoice) => setPaymentTarget(toPaymentTarget(invoice))}
        onContact={(id) => navigate(routes.contacts.detail.replace(':idAccount', id))}
        onPayments={() => navigate(routes.sales.payments)}
      />
      <ReceivablesReminderControls
        customer={reminderCustomer}
        invoice={reminderInvoice}
        onCloseCustomer={() => setReminderCustomer(null)}
        onCloseInvoice={() => setReminderInvoice(null)}
        onSent={invalidateWorkbench}
      />
      <PaySaleModal
        opened={Boolean(paymentTarget)}
        sale={paymentTarget}
        isSubmitting={paymentMutation.isPending}
        onClose={() => setPaymentTarget(null)}
        onSubmit={submitPayment}
      />
    </AppShellLayout>
  );
}
